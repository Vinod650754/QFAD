import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    prompt: { type: String, required: true },
    category: {
      type: String,
      enum: ["Coding", "Aptitude", "GK", "English", "Science"],
      required: true
    },
    topic: { type: String, required: true, trim: true, default: "General", index: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    options: [{ type: String, trim: true }],
    correctAnswer: { type: String, required: true, select: false },
    explanation: String,
    scheduledFor: { type: Date, required: true, index: true },
    xpReward: { type: Number, default: 20 },
    timeLimitSeconds: { type: Number, default: 300 },
    quote: {
      text: { type: String, default: "Small daily wins compound into mastery." },
      author: { type: String, default: "Question of the Day" }
    },
    isPublished: { type: Boolean, default: true },
    source: { type: String, default: "manual" },
    tags: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
