import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "../components/Grid.jsx";
import QuestionPanel from "../components/QuestionPanel.jsx";
import Navbar from "../components/Navbar.jsx";
import LeaderboardModal from "../components/LeaderboardModal.jsx";
import InstructionsModal from "../components/InstructionsModal.jsx";
import MessageBox from "../components/MessageBox.jsx";
import Timer from "../components/Timer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useSocket from "../hooks/useSocket.js";
import http from "../api/http.js";
import { fetchLeaderboard } from "../api/http.js";
import { SOCKET_EVENTS } from "../utils/constants.js";

const GamePage = () => {
  const { team, token, login } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket(token);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [modal, setModal] = useState(false);
  const [instructionsModal, setInstructionsModal] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [teamState, setTeamState] = useState(team);
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [clickedCells, setClickedCells] = useState(new Set(team?.clickedCells || []));
  const [revealedCells, setRevealedCells] = useState(() => {
    // Initialize revealed cells from team's found treasures
    const initial = new Set();
    if (team?.foundTreasures) {
      team.foundTreasures.forEach(treasure => {
        initial.add(treasure.cellIndex);
      });
    }
    return initial;
  });

  // Auto-clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "info" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || !team) {
      navigate("/");
      return;
    }
  }, [token, team, navigate]);

  // Fetch questions and check session status on mount
  useEffect(() => {
    if (!token || !team) return;

    const fetchQuestions = async () => {
      try {
        const response = await http.get("/questions");
        if (response?.data?.questions && Array.isArray(response.data.questions)) {
          setQuestions(response.data.questions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err.response?.data || err.message);
        setQuestions([]);
      }
    };

    const checkSessionStatus = async () => {
      try {
        const { data } = await http.get("/leaderboard/session-status");
        if (data?.session?.status === "running" && data.session?.endsAt) {
          const endTime = new Date(data.session.endsAt).getTime();
          setSessionEndTime(endTime);
        }
      } catch (err) {
        console.error("Failed to check session status:", err);
      }
    };

    fetchQuestions();
    checkSessionStatus();
  }, [token, team]);

  // Fetch leaderboard
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

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleSessionStopped = () => {
      navigate("/result");
    };

    const handleTeamUpdate = (updatedTeam) => {
      setTeamState(updatedTeam);
      setClickedCells(new Set(updatedTeam.clickedCells || []));
      const newRevealed = new Set();
      if (updatedTeam.foundTreasures && Array.isArray(updatedTeam.foundTreasures)) {
        updatedTeam.foundTreasures.forEach((treasure) => {
          if (treasure.cellIndex !== undefined) {
            newRevealed.add(treasure.cellIndex);
          }
        });
      }
      setRevealedCells(newRevealed);
    };

    const handleLeaderboardUpdate = (data) => {
      setLeaderboard(data || []);
    };

    const handleSessionStarted = (sessionData) => {
      if (sessionData?.endsAt) {
        const endTime = sessionData.endsAt instanceof Date
          ? sessionData.endsAt.getTime()
          : new Date(sessionData.endsAt).getTime();
        setSessionEndTime(endTime);
      }
    };

    const handleMessageBox = (payload) => {
      if (payload?.text) {
        setMessage({
          text: payload.text,
          type: payload.type || "info"
        });
      }
    };

    socket.on(SOCKET_EVENTS.SESSION_STOPPED, handleSessionStopped);
    socket.on(SOCKET_EVENTS.TEAM_UPDATE, handleTeamUpdate);
    socket.on(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
    socket.on(SOCKET_EVENTS.SESSION_STARTED, handleSessionStarted);
    socket.on(SOCKET_EVENTS.MESSAGE_BOX, handleMessageBox);

    socket.emit("joinGame", { teamId: team._id });

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_STOPPED, handleSessionStopped);
      socket.off(SOCKET_EVENTS.TEAM_UPDATE, handleTeamUpdate);
      socket.off(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
      socket.off(SOCKET_EVENTS.SESSION_STARTED, handleSessionStarted);
      socket.off(SOCKET_EVENTS.MESSAGE_BOX, handleMessageBox);
    };
  }, [socket, team, navigate]);

  // Build grid cells with proper state
  const gridCells = useMemo(() => {
    const attempts = teamState?.attemptsLeft || 0;
    return Array.from({ length: 36 }, (_, index) => {
      const isClicked = clickedCells.has(index);
      const isRevealed = revealedCells.has(index);

      // Find treasure type if revealed or found
      let treasureType = null;
      if (teamState?.foundTreasures && Array.isArray(teamState.foundTreasures)) {
        const treasure = teamState.foundTreasures.find(t => t.cellIndex === index);
        treasureType = treasure?.type;
      }

      let state = "hidden";
      let label = "";

      // Priority: treasure > mine > hidden
      if (treasureType || isRevealed) {
        state = "treasure";
        label = treasureType === "common" ? "💎" : treasureType === "rare" ? "💠" : treasureType === "legendary" ? "👑" : "💎";
      } else if (isClicked) {
        state = "mine";
        label = "💣";
      }

      // Cell is disabled if: no attempts left, already clicked, or already revealed
      const cellDisabled = attempts <= 0 || isClicked || isRevealed;

      return {
        index,
        label,
        state,
        treasureType,
        disabled: cellDisabled
      };
    });
  }, [clickedCells, revealedCells, teamState]);

  const handleAnswerSubmit = useCallback(async (questionId, answer) => {
    if (!answer || !answer.trim()) {
      setMessage({ text: "Please enter an answer", type: "warning" });
      return;
    }

    if (!team || !team._id) {
      setMessage({ text: "Team not found. Please login again.", type: "error" });
      return;
    }

    // Ensure questionId is a string
    const questionIdStr = typeof questionId === 'object' ? questionId.toString() : questionId;

    try {
      const response = await http.post(`/team/${team._id}/answer`, {
        questionId: questionIdStr,
        answer: answer.trim()
      });

      const { data } = response;

      if (data.success) {
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
        if (typeof data.pendingRevealCell !== "undefined") {
          setTeamState((prev) => (prev ? { ...prev, pendingRevealCell: data.pendingRevealCell } : prev));
        }
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to submit answer. Please try again.",
        type: "error"
      });
    }
  }, [team]);

  const handleCellClick = useCallback(async (index) => {
    if (clickedCells.has(index)) {
      return;
    }

    if (!team || !team._id) {
      setMessage({ text: "Team not available", type: "error" });
      return;
    }

    // Optimistic update - open cell immediately and decrement attempts
    setClickedCells(prev => new Set([...prev, index]));
    setTeamState(prev => prev ? { ...prev, attemptsLeft: Math.max(0, (prev.attemptsLeft || 0) - 1) } : prev);

    try {
      const response = await http.post(`/team/${team._id}/click`, { cellIndex: index });
      const { data } = response;

      // Update team state from server response
      if (data.team) {
        setTeamState(data.team);
        setClickedCells(new Set(data.team.clickedCells || []));

        if (data.team.foundTreasures && Array.isArray(data.team.foundTreasures)) {
          const newRevealed = new Set();
          data.team.foundTreasures.forEach(treasure => {
            if (treasure.cellIndex !== undefined) {
              newRevealed.add(treasure.cellIndex);
            }
          });
          setRevealedCells(newRevealed);
        }
      }

    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to click cell. Please try again.",
        type: "error"
      });
      // Revert optimistic update on error
      setClickedCells(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      // Revert attempts
      setTeamState(prev => prev ? { ...prev, attemptsLeft: (prev.attemptsLeft || 0) + 1 } : prev);
    }
  }, [team, clickedCells]);

  const currentTeam = teamState || team;
  const attemptsLeft = currentTeam?.attemptsLeft || 0;
  const solvedCount = currentTeam?.solvedQuestions?.length || 0;
  const points = currentTeam?.points ?? currentTeam?.score ?? 0;

  // Check if game should end
  useEffect(() => {
    if (sessionEndTime && Date.now() >= sessionEndTime) {
      navigate("/level2");
      return;
    }

    if (currentTeam?.completedLevel1) {
      setTimeout(() => navigate("/level2"), 2000);
      return;
    }

    if (attemptsLeft <= 0) {
      setTimeout(() => navigate("/level2"), 2000);
      return;
    }

    if (solvedCount >= questions.length && questions.length > 0) {
      setTimeout(() => navigate("/level2"), 2000);
      return;
    }
  }, [sessionEndTime, attemptsLeft, solvedCount, questions.length, navigate]);

  return (
    <div className="min-h-screen bg-background backdrop-blur-md">
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Navbar
          attemptsLeft={attemptsLeft}
          solvedCount={solvedCount}
          points={points}
          timeLeft={sessionEndTime ? <Timer end={sessionEndTime} /> : "00:00"}
          onOpenLeaderboard={() => setModal(true)}
          onOpenInstructions={() => setInstructionsModal(true)}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Grid Section - 65% on desktop */}
          <section className="lg:w-[65%] bg-card bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-neon border border-primary/50">
            <h2 className="text-xl font-bold mb-4 text-foreground">Treasure Grid</h2>
            <Grid cells={gridCells} onClick={handleCellClick} disabled={attemptsLeft <= 0} />
          </section>

          {/* Questions Section - 35% on desktop */}
          <section className="lg:w-[35%] bg-card bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-neon border border-primary/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Questions</h2>
            </div>
            {/* Message Box at top */}
            <MessageBox message={message.text} type={message.type} />
            <QuestionPanel
              questions={questions}
              answers={answers}
              onChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
              onSubmit={handleAnswerSubmit}
              solvedQuestions={currentTeam?.solvedQuestions || []}
            />
          </section>
        </div>

        <LeaderboardModal
          open={modal}
          onClose={() => setModal(false)}
          leaderboard={leaderboard}
        />
        <InstructionsModal
          open={instructionsModal}
          onClose={() => setInstructionsModal(false)}
        />
      </main>
    </div>
  );
};

export default GamePage;

