import { Router } from "express";
import { fetchLeaderboard } from "../controllers/leaderboardController.js";
import GameSession from "../models/GameSession.js";

const router = Router();

router.get("/", fetchLeaderboard);

// Public endpoint to check session status
router.get("/session-status", async (_req, res) => {
  try {
    const session = await GameSession.findOne({ status: "running" })
      .sort({ createdAt: -1 })
      .select("status startedAt endsAt config")
      .lean();
    
    if (session && session.endsAt) {
      res.json({
        success: true,
        session: {
          status: session.status,
          startedAt: session.startedAt,
          endsAt: session.endsAt,
          config: session.config
        }
      });
    } else {
      res.json({ success: true, session: null });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch session status" });
  }
});

export default router;

