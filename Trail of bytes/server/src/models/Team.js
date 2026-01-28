import mongoose from "mongoose";

const treasureSchema = new mongoose.Schema(
  {
    level: { type: Number, default: 1 },
    cellIndex: { type: Number, required: true },
    type: {
      type: String,
      enum: ["common", "rare", "legendary"],
      required: true
    }
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    points: { type: Number, default: 0 },
    score: { type: Number, default: 0 }, // legacy alias to keep old dashboards working
    totalScore: { type: Number, default: 0 }, // Cumulative score across all levels
    attemptsLeft: { type: Number, default: 15 },
    foundTreasures: { type: [treasureSchema], default: [] },
    currentSession: { type: mongoose.Schema.Types.ObjectId, ref: "GameSession" },
    solvedQuestions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
      default: []
    },
    clickedCells: { type: [Number], default: [], validate: [(val) => val.length <= 36] },
    pendingRevealCell: { type: Number, default: null },
    level: { type: Number, default: 1 },
    // Level 1 completion tracking
    level1CompletedAt: { type: Date, default: null },
    level1Rank: { type: Number, default: null },
    // Level 2 fields
    level2Points: { type: Number, default: 0 },
    level2SolvedQuestions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "DebugQuestion" }],
      default: []
    },
    level2HintsUsed: { type: [Number], default: [] }, // Array of question numbers where hints were used
    level2StartTime: { type: Date, default: null },
    level2EndTime: { type: Date, default: null }
  },
  { timestamps: true }
);

// unique: true on code already creates an index, so we only add the compound index
teamSchema.index({ currentSession: 1, points: -1 });

teamSchema.pre("save", function normalizeScore() {
  if (typeof this.points !== "number") {
    this.points = typeof this.score === "number" ? this.score : 0;
  }
  this.score = this.points;

  // Calculate cumulative score across all levels
  this.totalScore = (this.points || 0) + (this.level2Points || 0);
});

const Team = mongoose.model("Team", teamSchema);

export default Team;

