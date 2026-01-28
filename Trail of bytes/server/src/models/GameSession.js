import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    level: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["waiting", "running", "stopped", "finished"],
      default: "waiting"
    },
    startedAt: Date,
    endsAt: Date,
    // Level 1 completion tracking
    level1CompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    level1CompletedAt: { type: Date, default: null },
    level1Locked: { type: Boolean, default: false },
    config: {
      attemptsPerTeam: { type: Number, default: 15 },
      gridSize: { type: Number, default: 36 },
      scoreMap: {
        common: { type: Number, default: 100 },
        rare: { type: Number, default: 300 },
        legendary: { type: Number, default: 200 },
        mine: { type: Number, default: -50 }
      },
      gameTimeMinutes: { type: Number, default: 30 }
    }
  },
  { timestamps: true }
);

const GameSession = mongoose.model("GameSession", sessionSchema);

export default GameSession;

