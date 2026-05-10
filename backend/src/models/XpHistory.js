import mongoose from "mongoose";

const xpHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
  },
  { timestamps: true }
);

export default mongoose.model("XpHistory", xpHistorySchema);
