import express from "express";
import {
    getDebugQuestions,
    startLevel2,
    useHint,
    submitDebugAnswer,
    getLevel2Leaderboard,
    getLevel2Status
} from "../controllers/level2Controller.js";
import { teamAuth } from "../middleware/auth.js";

const router = express.Router();

// All routes require team authentication
router.use(teamAuth);

// Get all debug questions (without answers)
router.get("/questions", getDebugQuestions);

// Start Level 2 for a team
router.post("/start/:teamId", startLevel2);

// Use hint for a question (deducts points)
router.post("/hint/:teamId", useHint);

// Submit answer for a debug question
router.post("/submit/:teamId", submitDebugAnswer);

// Get Level 2 leaderboard
router.get("/leaderboard", getLevel2Leaderboard);

// Get team's Level 2 status
router.get("/status/:teamId", getLevel2Status);

export default router;
