import { Router } from "express";
import { teamAuth } from "../middleware/auth.js";
import Question from "../models/Question.js";

const router = Router();

router.use(teamAuth);
router.get("/", async (_req, res) => {
  const questions = await Question.find({})
    .select("text difficulty _id treasureCellIndex")
    .sort({ difficulty: 1, createdAt: 1 });
  res.json({ success: true, questions });
});

export default router;

