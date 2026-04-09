import Team from "../models/Team.js";
import { getRedisClient } from "../config/redis.js";

// In-memory cache for team names to prevent DB hits on every leaderboard poll
const teamNameCache = new Map();

export const getLeaderboard = async () => {
  const redis = getRedisClient();

  if (redis) {
    try {
      // Try Redis first
      const rawData = await redis.zRevRangeWithScores("leaderboard", 0, 49);
      if (rawData && rawData.length > 0) {
        const teamIds = rawData.map(item => item.value);

        // Figure out which team names we still need to fetch
        const missingIds = teamIds.filter(id => !teamNameCache.has(id));

        if (missingIds.length > 0) {
          const fetched = await Team.find({ _id: { $in: missingIds } }).select("name").lean();
          fetched.forEach(t => teamNameCache.set(t._id.toString(), t.name));
        }

        // Map back to ordered array without hitting DB again
        const sortedTeams = rawData.map(item => {
          const name = teamNameCache.get(item.value) || "Unknown";
          return {
            _id: item.value,
            name,
            points: item.score,     // Map item.score to points/totalScore for frontend
            score: item.score,
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

