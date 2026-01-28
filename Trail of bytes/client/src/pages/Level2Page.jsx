import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import http from "../api/http";

const Level2Page = () => {
    const { team, token } = useAuth();
    const navigate = useNavigate();
    const socketRef = useSocket(token);

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [points, setPoints] = useState(0);
    const [level1Points, setLevel1Points] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [solvedQuestions, setSolvedQuestions] = useState([]); // Array of question numbers
    const [hintsUsed, setHintsUsed] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes in seconds
    const [message, setMessage] = useState({ text: "", type: "info" });

    // Redirect if not authenticated
    useEffect(() => {
        if (!token || !team) {
            navigate("/");
        }
    }, [token, team, navigate]);

    // Fetch questions and start Level 2
    useEffect(() => {
        if (!token || !team) return;

        const initLevel2 = async () => {
            try {
                // Start Level 2
                await http.post(`/level2/start/${team._id}`);

                // Fetch questions
                const { data } = await http.get("/level2/questions");
                setQuestions(data.questions || []);

                // Fetch status
                const statusRes = await http.get(`/level2/status/${team._id}`);
                const { team: teamData } = statusRes.data;
                setPoints(teamData.level2Points || 0);
                setLevel1Points(teamData.points || 0);
                setTotalScore(teamData.totalScore || 0);
                // Extract question numbers from solved questions
                const solvedQuestionNumbers = (teamData.level2SolvedQuestions || []).map(q =>
                    typeof q === 'object' ? q.questionNumber : q
                );
                setSolvedQuestions(solvedQuestionNumbers);
                setHintsUsed(teamData.level2HintsUsed || []);
            } catch (err) {
                console.error("Failed to initialize Level 2:", err);
                setMessage({ text: "Failed to start Level 2", type: "error" });
            }
        };

        initLevel2();
    }, [token, team]);

    // Fetch leaderboard
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await http.get("/level2/leaderboard");
                setLeaderboard(data.leaderboard || []);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            }
        };

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5000);
        return () => clearInterval(interval);
    }, []);

    // Timer countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    navigate("/result");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    // Socket listeners for real-time updates
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleTeamUpdate = (updatedTeam) => {
            if (updatedTeam._id === team._id) {
                setPoints(updatedTeam.level2Points || 0);
                setLevel1Points(updatedTeam.points || 0);
                setTotalScore(updatedTeam.totalScore || 0);
                // Extract question numbers from solved questions
                const solvedQuestionNumbers = (updatedTeam.level2SolvedQuestions || []).map(q =>
                    typeof q === 'object' ? q.questionNumber : q
                );
                setSolvedQuestions(solvedQuestionNumbers);
                setHintsUsed(updatedTeam.level2HintsUsed || []);
            }
        };

        const handleLeaderboardUpdate = async () => {
            try {
                const { data } = await http.get("/level2/leaderboard");
                setLeaderboard(data.leaderboard || []);
            } catch (err) {
                console.error("Failed to update leaderboard:", err);
            }
        };

        socket.on("level2:teamUpdate", handleTeamUpdate);
        socket.on("level2:leaderboardUpdate", handleLeaderboardUpdate);

        return () => {
            socket.off("level2:teamUpdate", handleTeamUpdate);
            socket.off("level2:leaderboardUpdate", handleLeaderboardUpdate);
        };
    }, [socketRef, team]);

    // Auto-clear message
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: "", type: "info" });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleUseHint = async (questionNumber) => {
        if (hintsUsed.includes(questionNumber)) {
            setMessage({ text: "Hint already used for this question", type: "warning" });
            return;
        }

        try {
            const { data } = await http.post(`/level2/hint/${team._id}`, { questionNumber });
            setHintsUsed(data.team.level2HintsUsed || []);
            setPoints(data.team.level2Points || 0);
            setMessage({ text: data.message, type: "info" });
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || "Failed to use hint",
                type: "error"
            });
        }
    };

    const handleSubmitAnswer = async (questionNumber) => {
        const output = answers[questionNumber];

        if (!output || !output.trim()) {
            setMessage({ text: "Please enter the output", type: "warning" });
            return;
        }

        try {
            const { data } = await http.post(`/level2/submit/${team._id}`, {
                questionNumber,
                output: output.trim()
            });

            if (data.correct) {
                setMessage({ text: data.message, type: "success" });
                // Immediately update the solved questions with the question number from response
                const solvedQuestionNumber = data.questionNumber || questionNumber;
                setSolvedQuestions([...solvedQuestions, solvedQuestionNumber]);
                setPoints(data.team.level2Points || 0);
                setAnswers((prev) => {
                    const next = { ...prev };
                    delete next[questionNumber];
                    return next;
                });
            } else {
                setMessage({ text: data.message, type: "error" });
            }
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || "Failed to submit answer",
                type: "error"
            });
        }
    };

    const getQuestionStatus = (questionNumber) => {
        if (solvedQuestions.includes(questionNumber)) {
            return "Completed";
        }
        return "Pending";
    };

    const handleNextLevel = () => {
        setMessage({ text: "Level 3 not implemented yet", type: "info" });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="bg-card border-b-2 border-primary/30 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6 flex-wrap">
                        <span className="text-foreground font-bold text-lg">Level 2: {points} pts</span>
                        <span className="text-accent font-bold text-lg">Total: {totalScore} pts</span>
                        <span className="text-muted-foreground text-sm">(L1: {level1Points})</span>
                        <span className="text-foreground font-bold text-lg">
                            Timer: {formatTime(timeRemaining)}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition"
                        >
                            Leaderboard
                        </button>
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition"
                        >
                            Instructions
                        </button>
                        <button
                            onClick={handleNextLevel}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
                        >
                            Next Level
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
                    Level 2 - DEBUG RUSH
                </h1>

                {/* Message Box */}
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg border-2 ${message.type === "success"
                            ? "bg-green-900/20 border-green-500 text-green-400"
                            : message.type === "error"
                                ? "bg-red-900/20 border-red-500 text-red-400"
                                : message.type === "warning"
                                    ? "bg-yellow-900/20 border-yellow-500 text-yellow-400"
                                    : "bg-blue-900/20 border-blue-500 text-blue-400"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Questions */}
                <div className="space-y-4">
                    {questions.map((q, index) => {
                        const status = getQuestionStatus(q.questionNumber);
                        const isExpanded = expandedQuestion === q.questionNumber;
                        const hintUsed = hintsUsed.includes(q.questionNumber);
                        const isSolved = status === "Completed";

                        return (
                            <div
                                key={q._id}
                                className="bg-card border-2 border-primary/30 rounded-lg overflow-hidden transition-all"
                                style={{
                                    boxShadow: "2px 2px 0 rgba(0, 255, 255, 0.3)"
                                }}
                            >
                                {/* Question Header */}
                                <button
                                    onClick={() => setExpandedQuestion(isExpanded ? null : q.questionNumber)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/10 transition text-left"
                                    disabled={isSolved}
                                >
                                    <span className="text-foreground font-semibold">
                                        Question {q.questionNumber}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${status === "Completed"
                                            ? "bg-green-500/20 text-green-400 border border-green-500"
                                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500"
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && !isSolved && (
                                    <div className="px-6 py-4 space-y-4 border-t-2 border-primary/30 animate-slideDown">
                                        {/* Code Snippet */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-accent mb-2">Code Snippet:</h3>
                                            <pre className="bg-background p-4 rounded border border-primary/20 overflow-x-auto text-sm text-foreground">
                                                <code>{q.codeSnippet}</code>
                                            </pre>
                                        </div>

                                        {/* Expected Behavior */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-accent mb-2">Expected Behavior:</h3>
                                            <p className="text-foreground/80">{q.expectedBehavior}</p>
                                        </div>

                                        {/* Broken Logic */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-accent mb-2">Broken Logic:</h3>
                                            <p className="text-foreground/80">{q.brokenLogic}</p>
                                        </div>

                                        {/* Hint */}
                                        {hintUsed && (
                                            <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded">
                                                <h3 className="text-sm font-semibold text-yellow-400 mb-1">Hint (-50 points):</h3>
                                                <p className="text-yellow-300/90 text-sm">{q.hint}</p>
                                            </div>
                                        )}

                                        {/* User Input */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-accent mb-2">Your Output:</h3>
                                            <textarea
                                                value={answers[q.questionNumber] || ""}
                                                onChange={(e) =>
                                                    setAnswers((prev) => ({
                                                        ...prev,
                                                        [q.questionNumber]: e.target.value
                                                    }))
                                                }
                                                placeholder="Enter the expected output here..."
                                                className="w-full bg-background border border-primary/30 rounded p-3 text-foreground focus:outline-none focus:border-primary resize-none"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleUseHint(q.questionNumber)}
                                                disabled={hintUsed}
                                                className={`px-4 py-2 rounded font-medium transition ${hintUsed
                                                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                                                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    }`}
                                            >
                                                {hintUsed ? "Hint Used" : "Hint (-50)"}
                                            </button>
                                            <button
                                                onClick={() => handleSubmitAnswer(q.questionNumber)}
                                                className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded font-medium transition"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border-2 border-primary rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="text-foreground hover:text-primary text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {leaderboard.map((entry) => (
                                <div
                                    key={entry.rank}
                                    className="flex items-center justify-between p-3 bg-background rounded border border-primary/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-accent font-bold">#{entry.rank}</span>
                                        <span className="text-foreground">{entry.teamName}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-primary font-bold">{entry.totalScore} pts</div>
                                        <div className="text-foreground/60 text-sm">
                                            L1: {entry.level1Points} | L2: {entry.level2Points}
                                        </div>
                                        <div className="text-foreground/60 text-sm">{entry.solvedCount}/10</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border-2 border-primary rounded-lg max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-foreground">Instructions</h2>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="text-foreground hover:text-primary text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-3 text-foreground/90">
                            <p>🐛 <strong>Debug Rush:</strong> Fix the code and write the correct output!</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>10 debugging questions, each worth <strong>+200 points</strong></li>
                                <li>Submit the <strong>correct OUTPUT</strong>, not the fixed code</li>
                                <li>Use hints to help you, but it costs <strong>-50 points</strong></li>
                                <li>You have <strong>40 minutes</strong> to complete all questions</li>
                                <li>Points update in real-time across all teams</li>
                            </ul>
                            <p className="text-accent mt-4">Good luck! 🚀</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Level2Page;
