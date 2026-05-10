import dotenv from "dotenv";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import Streak from "../models/Streak.js";
import User from "../models/User.js";
import XpHistory from "../models/XpHistory.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const users = [
  { name: "Asha Learner", email: "asha@example.com", password: "Student123!", xp: 140 },
  { name: "Ravi Builder", email: "ravi@example.com", password: "Student123!", xp: 220 },
  { name: "Mina Analyst", email: "mina@example.com", password: "Student123!", xp: 90 }
];

const run = async () => {
  await connectDB();
  const questions = await Question.find().limit(8).select("+correctAnswer");
  if (!questions.length) throw new Error("Run npm run seed before seed:demo");

  for (const item of users) {
    let user = await User.findOne({ email: item.email });
    if (!user) user = await User.create(item);

    await Streak.findOneAndUpdate(
      { user: user._id },
      { current: Math.max(1, Math.floor(item.xp / 70)), longest: Math.max(2, Math.floor(item.xp / 50)), lastAnsweredDate: new Date() },
      { upsert: true }
    );

    for (const [index, question] of questions.entries()) {
      const isCorrect = (index + item.xp) % 3 !== 0;
      const exists = await Answer.findOne({ user: user._id, question: question._id });
      if (exists) continue;

      const xpEarned = isCorrect ? question.xpReward : Math.ceil(question.xpReward / 4);
      await Answer.create({
        user: user._id,
        question: question._id,
        answer: isCorrect ? question.correctAnswer : "Demo wrong answer",
        isCorrect,
        xpEarned,
        timeSpentSeconds: 35 + index * 8
      });
      await XpHistory.create({
        user: user._id,
        points: xpEarned,
        reason: isCorrect ? "Demo correct answer" : "Demo participation",
        question: question._id
      });
    }
  }

  console.log("Demo users and analytics data seeded. Student password: Student123!");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
