import { clickCell, submitAnswer } from "../services/gameService.js";
import { getLeaderboard } from "../services/leaderboardService.js";
import { emitTeamUpdate, emitLeaderboard, emitMessage } from "../sockets/index.js";

let ioRef;
export const attachTeamSocket = (io) => {
  ioRef = io;
};

export const answerQuestion = async (req, res, next) => {
  try {
    if (req.team._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const { correct, team } = await submitAnswer({
      teamId: req.params.id,
      questionId: req.body.questionId,
      answer: req.body.answer
    });

    emitTeamUpdate(ioRef, team);

    const messagePayload = correct
      ? {
        text: `Correct Answer! Click → ${team.pendingRevealCell} to find the treasure.`,
        type: "success"
      }
      : { text: "Wrong Answer. Try again.", type: "error" };
    emitMessage(ioRef, team._id, messagePayload);

    res.json({ success: true, correct, pendingRevealCell: team.pendingRevealCell });
  } catch (err) {
    next(err);
  }
};

export const clickGrid = async (req, res, next) => {
  try {
    if (req.team._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await clickCell({
      teamId: req.params.id,
      cellIndex: req.body.cellIndex
    });
    emitTeamUpdate(ioRef, result.team);
    const leaderboard = await getLeaderboard();
    emitLeaderboard(ioRef, leaderboard);
    emitMessage(ioRef, result.team._id, {
      text: result.message,
      type: result.delta >= 0 ? "success" : "error"
    });

    // Check if Level 1 was just completed
    const GameSession = (await import("../models/GameSession.js")).default;
    const session = await GameSession.findOne({ status: "running" });
    if (session && session.level1Locked && session.level1CompletedBy) {
      const winningTeam = await import("../models/Team.js").then(m => m.default.findById(session.level1CompletedBy));
      // Emit Level 1 locked event to all clients
      ioRef.emit("level1:locked", {
        completedBy: session.level1CompletedBy,
        completedAt: session.level1CompletedAt,
        winningTeamName: winningTeam?.name || "Unknown"
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

