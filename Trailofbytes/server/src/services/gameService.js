import mongoose from "mongoose";
import createError from "http-errors";
import Team from "../models/Team.js";
import Question from "../models/Question.js";
import GameSession from "../models/GameSession.js";
import { normalizeAnswer } from "../utils/normalize.js";
import { SCORE_MAP } from "../utils/constants.js";
import { getRedisClient } from "../config/redis.js";
import { updateLeaderboardScore } from "./leaderboardService.js";

let activeSessionCache = null;
let activeSessionCacheTime = 0;

export const findActiveSession = async () => {
  const now = Date.now();
  if (activeSessionCache && now - activeSessionCacheTime < 5000) {
    return activeSessionCache;
  }
  const session = await GameSession.findOne({ status: "running" }).sort({
    createdAt: -1
  }).lean(); // Use lean() for faster read access
  activeSessionCache = session;
  activeSessionCacheTime = now;
  return session;
};

// Clear cache when session explicitly manipulated
export const invalidateSessionCache = () => {
  activeSessionCache = null;
  activeSessionCacheTime = 0;
};

const questionCache = new Map();

export const submitAnswer = async ({ teamId, questionId, answer }) => {
  const session = await findActiveSession();
  if (!session) {
    throw createError(400, "No active session");
  }

  // Cache questions since they don't change
  let question = questionCache.get(questionId.toString());
  if (!question) {
    question = await Question.findById(questionId).lean();
    if (!question) {
      throw createError(404, "Question not found");
    }
    questionCache.set(questionId.toString(), question);
  }

  const redis = getRedisClient();
  if (redis) {
    const lockKey = `submit_lock:${teamId}`;
    const exists = await redis.exists(lockKey);
    if (exists) {
      throw createError(429, "Please wait 3 seconds before submitting again.");
    }
    await redis.set(lockKey, "1", { EX: 3 });
  }

  const normalized = normalizeAnswer(answer);
  const correct = normalized === question.answer;

  const baseQuery = {
    _id: teamId,
    currentSession: session._id
  };

  if (correct) {
    await Team.updateOne(baseQuery, {
      $set: { pendingRevealCell: question.treasureCellIndex },
      $addToSet: { solvedQuestions: question._id }
    });
  } else {
    await Team.updateOne(baseQuery, { $set: { pendingRevealCell: null } });
  }

  let updatedTeam = await Team.findById(teamId);
  if (!updatedTeam) {
    throw createError(404, "Team not found");
  }

  if (correct && !updatedTeam.completedLevel1) {
    const totalQuestions = await Question.countDocuments();
    if (updatedTeam.solvedQuestions.length >= totalQuestions) {
      updatedTeam.completedLevel1 = true;
      updatedTeam.level1CompletedAt = new Date();
      await updatedTeam.save();
    }
  }

  return {
    correct,
    team: updatedTeam,
    question
  };
};

export const clickCell = async ({ teamId, cellIndex }) => {
  const session = await findActiveSession();
  if (!session) throw createError(400, "No active session");

  if (cellIndex < 0 || cellIndex >= session.config.gridSize) {
    throw createError(400, "Invalid cell index");
  }

  const team = await Team.findById(teamId);
  if (!team) throw createError(404, "Team not found");

  if (team.attemptsLeft <= 0) {
    throw createError(400, "No attempts left");
  }
  if (team.clickedCells.includes(cellIndex)) {
    throw createError(400, "Cell already opened");
  }

  const updateQuery = {
    $inc: { attemptsLeft: -1, level1AttemptsUsed: 1 },
    $addToSet: { clickedCells: cellIndex }
  };

  let delta = SCORE_MAP.mine;
  let message = "Mine triggered! -50 points.";
  let treasure = null;

  if (team.pendingRevealCell === cellIndex) {
    // Attempt to find question from cache first by searching values
    let question = Array.from(questionCache.values()).find(q => q.treasureCellIndex === cellIndex);
    if (!question) {
      question = await Question.findOne({ treasureCellIndex: cellIndex }).lean();
      if (question) {
        questionCache.set(question._id.toString(), question);
      }
    }
    const difficulty = question?.difficulty || "common";
    delta = SCORE_MAP[difficulty] ?? SCORE_MAP.common;
    treasure = {
      cellIndex,
      level: team.level || 1,
      type: difficulty
    };
    message = `Treasure found! +${delta} points.`;
    updateQuery.$set = { pendingRevealCell: null };
    updateQuery.$push = { foundTreasures: treasure };
  }

  updateQuery.$inc.points = (updateQuery.$inc.points || 0) + delta;
  updateQuery.$inc.score = (updateQuery.$inc.score || 0) + delta;
  updateQuery.$inc.totalScore = (updateQuery.$inc.totalScore || 0) + delta;

  let updatedTeam = await Team.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(teamId),
      currentSession: session._id,
      attemptsLeft: { $gt: 0 },
      clickedCells: { $ne: cellIndex }
    },
    updateQuery,
    { new: true }
  );

  if (!updatedTeam) {
    throw createError(400, "Invalid click");
  }

  const totalQuestions = await Question.countDocuments();
  const allTreasuresFound = updatedTeam.foundTreasures.length >= totalQuestions;

  if (!updatedTeam.completedLevel1 && (updatedTeam.attemptsLeft <= 0 || allTreasuresFound)) {
    updatedTeam.completedLevel1 = true;
    updatedTeam.level1CompletedAt = new Date();
    await updatedTeam.save();
  }

  if (delta !== 0) {
    await updateLeaderboardScore(updatedTeam._id, updatedTeam.totalScore);
  }

  return {
    team: updatedTeam,
    delta,
    treasure,
    message
  };
};

