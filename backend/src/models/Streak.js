import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastAnsweredDate: Date
  },
  { timestamps: true }
);

export default mongoose.model("Streak", streakSchema);
