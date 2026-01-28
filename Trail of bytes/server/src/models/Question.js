import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["common", "rare", "legendary"],
      required: true
    },
    treasureCellIndex: { type: Number, min: 0, max: 35, required: true }
  },
  { timestamps: true }
);

questionSchema.index({ difficulty: 1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;

