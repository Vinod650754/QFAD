import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
    timeSpentSeconds: Number
  },
  { timestamps: true }
);

answerSchema.index({ user: 1, question: 1 }, { unique: true });

export default mongoose.model("Answer", answerSchema);
