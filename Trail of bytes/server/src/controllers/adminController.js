import ActionLog from "../models/ActionLog.js";
import Team from "../models/Team.js";
import GameSession from "../models/GameSession.js";
import { auditLog } from "../utils/logger.js";

const writeAudit = auditLog(ActionLog);

export const getDashboard = async (_req, res) => {
  const [session, teams, logs] = await Promise.all([
    GameSession.findOne().sort({ createdAt: -1 }),
    Team.find({}).sort({ createdAt: 1 }).select("name points score attemptsLeft"),
    ActionLog.find({}).sort({ createdAt: -1 }).limit(50)
  ]);

  res.json({ success: true, session, teams, logs });
};

export const penalizeTeam = async (req, res) => {
  const { teamId } = req.params;
  const { delta } = req.body;
  const team = await Team.findByIdAndUpdate(
    teamId,
    { $inc: { points: delta } },
    { new: true }
  );
  await writeAudit(req.admin._id, "penalizeTeam", { teamId, delta });
  res.json({ success: true, team });
};

