import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LobbyList from "../components/LobbyList.jsx";
import LeaderboardModal from "../components/LeaderboardModal.jsx";
import Navbar from "../components/Navbar.jsx";
import useSocket from "../hooks/useSocket.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchLeaderboard } from "../api/http.js";
import { SOCKET_EVENTS } from "../utils/constants.js";

const LobbyPage = () => {
  const { token, team } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket(token);
  const [teams, setTeams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (!socket) return;

    socket.emit(SOCKET_EVENTS.JOIN_LOBBY);

    const handleLobbyUpdate = (data) => {
      setTeams(data || []);
    };

    const handleSessionStarted = () => {
      navigate("/game");
    };

    socket.on(SOCKET_EVENTS.LOBBY_UPDATE, handleLobbyUpdate);
    socket.on(SOCKET_EVENTS.SESSION_STARTED, handleSessionStarted);

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATE, handleLobbyUpdate);
      socket.off(SOCKET_EVENTS.SESSION_STARTED, handleSessionStarted);
    };
  }, [socket, token, navigate]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await fetchLeaderboard();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background backdrop-blur-md">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Navbar
          attemptsLeft={team?.attemptsLeft ?? 15}
          solvedCount={team?.solvedQuestions?.length ?? 0}
          points={team?.points ?? 0}
          timeLeft="00:00"
          onOpenLeaderboard={() => setModal(true)}
          onOpenInstructions={() => { }}
        />
        <div className="bg-card bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-neon border border-primary/50">
          <h1 className="text-3xl font-bold mb-6 text-center text-foreground">
            Waiting for Game to Start
          </h1>
          <LobbyList teams={teams} />
        </div>
        <LeaderboardModal open={modal} onClose={() => setModal(false)} leaderboard={leaderboard} />
      </main>
    </div>
  );
};

export default LobbyPage;

