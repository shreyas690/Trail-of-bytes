import DebugQuestion from "../models/DebugQuestion.js";
import Team from "../models/Team.js";

const LEVEL2_DURATION = 40 * 60 * 1000; // 40 minutes
const HINT_PENALTY = 50;
const QUESTION_POINTS = 200;

// Get all debug questions for Level 2
export const getDebugQuestions = async (req, res) => {
    try {
        const questions = await DebugQuestion.find()
            .select("-correctOutput") // Don't send correct answer to client
            .sort({ questionNumber: 1 });

        res.json({ success: true, questions });
    } catch (error) {
        console.error("Error fetching debug questions:", error);
        res.status(500).json({ success: false, message: "Failed to fetch debug questions" });
    }
};

// Start Level 2 for a team
export const startLevel2 = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Initialize Level 2
        team.level = 2;
        team.level2Points = 0;
        team.level2SolvedQuestions = [];
        team.level2HintsUsed = [];
        team.level2StartTime = new Date();
        team.level2EndTime = new Date(Date.now() + LEVEL2_DURATION);

        await team.save();

        res.json({
            success: true,
            team,
            endTime: team.level2EndTime
        });
    } catch (error) {
        console.error("Error starting Level 2:", error);
        res.status(500).json({ success: false, message: "Failed to start Level 2" });
    }
};

// Use hint for a question
export const useHint = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { questionNumber } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Check if already used hint for this question
        if (team.level2HintsUsed.includes(questionNumber)) {
            return res.status(400).json({
                success: false,
                message: "Hint already used for this question"
            });
        }

        // Deduct hint penalty
        team.level2Points = Math.max(0, team.level2Points - HINT_PENALTY);
        team.level2HintsUsed.push(questionNumber);

        await team.save();

        // Emit socket event for real-time update
        const io = req.app.get("io");
        if (io) {
            io.emit("level2:teamUpdate", team);
            io.emit("level2:leaderboardUpdate");
        }

        res.json({
            success: true,
            team,
            message: `Hint used. -${HINT_PENALTY} points`
        });
    } catch (error) {
        console.error("Error using hint:", error);
        res.status(500).json({ success: false, message: "Failed to use hint" });
    }
};

// Submit answer for a debug question
export const submitDebugAnswer = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { questionNumber, output } = req.body;

        if (!output || !output.trim()) {
            return res.status(400).json({ success: false, message: "Output cannot be empty" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Check if time is up
        if (team.level2EndTime && new Date() > team.level2EndTime) {
            return res.status(400).json({
                success: false,
                message: "Time's up! Level 2 has ended."
            });
        }

        const question = await DebugQuestion.findOne({ questionNumber });
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Check if already solved
        if (team.level2SolvedQuestions.includes(question._id)) {
            return res.status(400).json({
                success: false,
                message: "Question already solved"
            });
        }

        // Normalize answers for comparison (trim whitespace, case-insensitive)
        const normalizedOutput = output.trim().toLowerCase();
        const normalizedCorrect = question.correctOutput.trim().toLowerCase();

        if (normalizedOutput === normalizedCorrect) {
            // Correct answer!
            team.level2Points += QUESTION_POINTS;
            team.level2SolvedQuestions.push(question._id);

            await team.save();

            // Emit socket event for real-time update
            const io = req.app.get("io");
            if (io) {
                io.emit("level2:teamUpdate", team);
                io.emit("level2:leaderboardUpdate");
            }

            res.json({
                success: true,
                correct: true,
                team,
                message: `Correct! +${QUESTION_POINTS} points`,
                pointsEarned: QUESTION_POINTS,
                questionNumber: question.questionNumber
            });
        } else {
            res.json({
                success: true,
                correct: false,
                message: "Incorrect output. Try again!",
                pointsEarned: 0
            });
        }
    } catch (error) {
        console.error("Error submitting debug answer:", error);
        res.status(500).json({ success: false, message: "Failed to submit answer" });
    }
};

// Get Level 2 leaderboard
export const getLevel2Leaderboard = async (req, res) => {
    try {
        const teams = await Team.find({ level: 2 })
            .select("name points level2Points totalScore level2SolvedQuestions")
            .sort({ totalScore: -1, level2SolvedQuestions: 1 })
            .limit(10);

        const leaderboard = teams.map((team, index) => ({
            rank: index + 1,
            teamName: team.name,
            level1Points: team.points || 0,
            level2Points: team.level2Points || 0,
            totalScore: team.totalScore || 0,
            solvedCount: team.level2SolvedQuestions.length
        }));

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error("Error fetching Level 2 leaderboard:", error);
        res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
    }
};

// Get team's Level 2 status
export const getLevel2Status = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId)
            .populate("level2SolvedQuestions", "questionNumber");

        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        const now = new Date();
        const timeRemaining = team.level2EndTime
            ? Math.max(0, team.level2EndTime - now)
            : LEVEL2_DURATION;

        res.json({
            success: true,
            team,
            timeRemaining,
            isActive: team.level2StartTime && (!team.level2EndTime || now < team.level2EndTime)
        });
    } catch (error) {
        console.error("Error fetching Level 2 status:", error);
        res.status(500).json({ success: false, message: "Failed to fetch status" });
    }
};
