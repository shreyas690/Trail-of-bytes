import mongoose from "mongoose";

const debugQuestionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    codeSnippet: { type: String, required: true },
    expectedBehavior: { type: String, required: true },
    brokenLogic: { type: String, required: true },
    correctOutput: { type: String, required: true },
    hint: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["medium", "hard"],
      required: true
    },
    points: { type: Number, default: 200 }
  },
  { timestamps: true }
);

debugQuestionSchema.index({ questionNumber: 1 });

const DebugQuestion = mongoose.model("DebugQuestion", debugQuestionSchema);

export default DebugQuestion;
