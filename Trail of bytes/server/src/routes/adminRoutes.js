import { Router } from "express";
import Joi from "joi";
import { adminAuth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { getDashboard, penalizeTeam } from "../controllers/adminController.js";
import {
  startSession,
  stopSession,
  resetSession
} from "../controllers/sessionController.js";
import {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from "../controllers/questionController.js";

const router = Router();
router.use(adminAuth);

router.get("/dashboard", getDashboard);
router.post("/session/start", startSession);
router.post("/session/stop", stopSession);
router.post("/session/reset", resetSession);
router.get("/session/level1-status", async (req, res) => {
  try {
    const GameSession = (await import("../models/GameSession.js")).default;
    const Team = (await import("../models/Team.js")).default;

    const session = await GameSession.findOne({ status: "running" });
    if (!session) {
      return res.json({ success: true, level1Locked: false, session: null });
    }

    let winningTeam = null;
    if (session.level1CompletedBy) {
      winningTeam = await Team.findById(session.level1CompletedBy).select("name");
    }

    res.json({
      success: true,
      level1Locked: session.level1Locked,
      completedBy: session.level1CompletedBy,
      completedAt: session.level1CompletedAt,
      winningTeamName: winningTeam?.name || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch Level 1 status" });
  }
});

router.get("/questions", listQuestions);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

const penaltySchema = Joi.object({
  params: Joi.object({ teamId: Joi.string().required() }).required(),
  body: Joi.object({ delta: Joi.number().required() }).required(),
  query: Joi.object().unknown(true)
});

router.post(
  "/teams/:teamId/penalize",
  validate(penaltySchema),
  penalizeTeam
);

export default router;

