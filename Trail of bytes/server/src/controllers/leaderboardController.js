import { getLeaderboard } from "../services/leaderboardService.js";

export const fetchLeaderboard = async (_req, res) => {
  const leaderboard = await getLeaderboard();
  res.json({ success: true, leaderboard });
};

