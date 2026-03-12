import Team from "../models/Team.js";
import { getRedisClient } from "../config/redis.js";

export const getLeaderboard = async () => {
  const redis = getRedisClient();

  if (redis) {
    try {
      // Try Redis first
      const rawData = await redis.zRevRangeWithScores("leaderboard", 0, 49);
      if (rawData && rawData.length > 0) {
        // Fetch team names from Mongo for these IDs
        const teamIds = rawData.map(item => item.value);
        const teams = await Team.find({ _id: { $in: teamIds } }).select("name points score _id totalScore level2Points").lean();

        // Map back to ordered array
        const teamMap = {};
        teams.forEach(t => teamMap[t._id.toString()] = t);

        const sortedTeams = rawData.map(item => {
          const team = teamMap[item.value] || { _id: item.value, name: "Unknown" };
          return {
            ...team,
            totalScore: item.score
          };
        }).filter(t => t.name !== "Unknown");

        return sortedTeams;
      }
    } catch (error) {
      console.error("Redis leaderboard fetch failed, falling back to MongoDB:", error);
    }
  }

  // Fallback to MongoDB
  const teams = await Team.find({})
    .sort({ totalScore: -1, points: -1, score: -1, updatedAt: 1 })
    .limit(50)
    .lean();

  return teams;
};

export const updateLeaderboardScore = async (teamId, totalScore) => {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.zAdd("leaderboard", [{ score: totalScore, value: teamId.toString() }]);
    } catch (error) {
      console.error("Redis zAdd failed:", error);
    }
  }
};

