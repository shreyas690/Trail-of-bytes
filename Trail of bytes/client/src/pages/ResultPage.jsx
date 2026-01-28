import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardModal from "../components/LeaderboardModal.jsx";
import { fetchLeaderboard } from "../api/http.js";

const ResultPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard().then(({ data }) => setLeaderboard(data.leaderboard));
  }, []);

  return (
    <main className="max-w-4xl mx-auto py-10 text-center space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Level 1 Complete! 🎉</h1>
      <p className="text-foreground/80">Great job completing the treasure hunt!</p>

      <button
        onClick={() => navigate("/level2")}
        className="px-8 py-3 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/80 transition shadow-neon"
      >
        Continue to Level 2: DEBUG RUSH →
      </button>

      <LeaderboardModal open={true} onClose={() => { }} leaderboard={leaderboard} />
    </main>
  );
};

export default ResultPage;

