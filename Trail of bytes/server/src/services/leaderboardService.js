import Team from "../models/Team.js";

export const getLeaderboard = async () => {
  const teams = await Team.find({})
    .sort({ points: -1, score: -1, updatedAt: 1 })
    .limit(50)
    .lean();

  return teams;
};

