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
    // Removed emitLeaderboard to prevent mass socket spam on every click since frontend polls it
    emitMessage(ioRef, result.team._id, {
      text: result.message,
      type: result.delta >= 0 ? "success" : "error"
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

