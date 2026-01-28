import mongoose from "mongoose";
import createError from "http-errors";
import Team from "../models/Team.js";
import Question from "../models/Question.js";
import GameSession from "../models/GameSession.js";
import { normalizeAnswer } from "../utils/normalize.js";
import { SCORE_MAP } from "../utils/constants.js";

export const findActiveSession = async () => {
  const session = await GameSession.findOne({ status: "running" }).sort({
    createdAt: -1
  });
  return session;
};

export const submitAnswer = async ({ teamId, questionId, answer }) => {
  const session = await findActiveSession();
  if (!session) {
    throw createError(400, "No active session");
  }

  const question = await Question.findById(questionId);
  if (!question) {
    throw createError(404, "Question not found");
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

  const updatedTeam = await Team.findById(teamId);
  if (!updatedTeam) {
    throw createError(404, "Team not found");
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

  // Check if Level 1 is locked
  if (session.level1Locked) {
    throw createError(400, "Level 1 has been completed by another team. Please proceed to Level 2.");
  }

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
    $inc: { attemptsLeft: -1 },
    $addToSet: { clickedCells: cellIndex }
  };

  let delta = SCORE_MAP.mine;
  let message = "Mine triggered! -50 points.";
  let treasure = null;

  if (team.pendingRevealCell === cellIndex) {
    const question = await Question.findOne({ treasureCellIndex: cellIndex });
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

  const updatedTeam = await Team.findOneAndUpdate(
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

  // Check if this team has completed Level 1 (found all treasures)
  const totalQuestions = await Question.countDocuments();
  if (updatedTeam.foundTreasures.length >= totalQuestions && !session.level1Locked) {
    // This team completed Level 1 first!
    await completeLevel1(session, updatedTeam);
  }

  return {
    team: updatedTeam,
    delta,
    treasure,
    message
  };
};

// Helper function to mark Level 1 as complete
export const completeLevel1 = async (session, team) => {
  // Use atomic update to prevent race conditions
  const updatedSession = await GameSession.findOneAndUpdate(
    { _id: session._id, level1Locked: false }, // Only update if not already locked
    {
      $set: {
        level1Locked: true,
        level1CompletedBy: team._id,
        level1CompletedAt: new Date()
      }
    },
    { new: true }
  );

  // If session was updated, this team won
  if (updatedSession && updatedSession.level1Locked) {
    // Assign rank 1 to this team
    await Team.findByIdAndUpdate(team._id, {
      $set: {
        level1CompletedAt: new Date(),
        level1Rank: 1
      }
    });

    return true; // Level 1 completed by this team
  }

  return false; // Another team already completed Level 1
};


