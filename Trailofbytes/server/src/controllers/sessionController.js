import GameSession from "../models/GameSession.js";
import Team from "../models/Team.js";
import { SESSION_STATUS } from "../utils/constants.js";
import ActionLog from "../models/ActionLog.js";
import { emitSessionUpdate } from "../sockets/index.js";
import { invalidateSessionCache } from "../services/gameService.js";

let ioRef;

export const attachSocket = (io) => {
  ioRef = io;
};

const logAction = async (adminId, action, meta = {}) => {
  await ActionLog.create({ adminId, action, meta });
};

export const startSession = async (req, res) => {
  const minutes = Number(process.env.GAME_TIME_MINUTES || 30);

  const session = await GameSession.findOneAndUpdate(
    { status: { $in: [SESSION_STATUS.WAITING, SESSION_STATUS.STOPPED] } },
    {
      status: SESSION_STATUS.RUNNING,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + minutes * 60000),
      "config.gameTimeMinutes": minutes
    },
    { new: true, upsert: true }
  );

  const attemptsPerTeam = session?.config?.attemptsPerTeam || Number(process.env.ATTEMPTS_PER_TEAM || 15);

  await Team.updateMany(
    {},
    {
      $set: {
        currentSession: session._id,
        attemptsLeft: attemptsPerTeam,
        points: 0,
        score: 0,
        totalScore: 0,
        clickedCells: [],
        foundTreasures: [],
        solvedQuestions: [],
        pendingRevealCell: null,
        completedLevel1: false,
        level1AttemptsUsed: 0,
        level1CompletedAt: null,
        level1Rank: null
      }
    }
  );

  await logAction(req.admin._id, "startSession", { sessionId: session._id });
  invalidateSessionCache();
  emitSessionUpdate(ioRef, SESSION_STATUS.RUNNING, session);
  res.json({ success: true, session });
};

export const stopSession = async (req, res) => {
  const session = await GameSession.findOneAndUpdate(
    { status: SESSION_STATUS.RUNNING },
    { status: SESSION_STATUS.STOPPED },
    { new: true }
  );
  await logAction(req.admin._id, "stopSession", { sessionId: session?._id });
  invalidateSessionCache();
  emitSessionUpdate(ioRef, SESSION_STATUS.STOPPED);
  res.json({ success: true, session });
};

export const resetSession = async (req, res) => {
  await Team.updateMany(
    {},
    {
      $set: {
        points: 0,
        attemptsLeft: 15,
        foundTreasures: [],
        solvedQuestions: [],
        clickedCells: [],
        score: 0,
        totalScore: 0,
        pendingRevealCell: null,
        completedLevel1: false,
        level1AttemptsUsed: 0,
        level1CompletedAt: null,
        level1Rank: null
      }
    }
  );
  const session = await GameSession.findOneAndUpdate(
    {},
    {
      status: SESSION_STATUS.WAITING,
      startedAt: null,
      endsAt: null
    },
    { new: true }
  );
  await logAction(req.admin._id, "resetSession", { sessionId: session?._id });
  invalidateSessionCache();
  emitSessionUpdate(ioRef, SESSION_STATUS.WAITING);
  res.json({ success: true, session });
};

