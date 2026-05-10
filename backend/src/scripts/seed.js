import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Streak from "../models/Streak.js";
import { startOfUtcDay } from "../utils/date.js";

dotenv.config();

const today = startOfUtcDay();

const run = async () => {
  await connectDB();

  const adminEmail = "admin@qotd.local";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: "Admin123!",
      role: "admin"
    });
    await Streak.create({ user: admin._id });
  }

  await Question.deleteMany({});
  await Question.insertMany([
    {
      title: "Array Fundamentals",
      prompt: "Which method adds one or more elements to the end of a JavaScript array?",
      category: "Coding",
      topic: "JavaScript Arrays",
      difficulty: "Easy",
      options: ["push()", "pop()", "shift()", "slice()"],
      correctAnswer: "push()",
      explanation: "push() mutates the array by appending items and returns the new length.",
      scheduledFor: today,
      xpReward: 25,
      createdBy: admin._id
    },
    {
      title: "Science Starter",
      prompt: "What is the chemical symbol for water?",
      category: "Science",
      topic: "Chemistry",
      difficulty: "Easy",
      options: ["O2", "CO2", "H2O", "NaCl"],
      correctAnswer: "H2O",
      explanation: "A water molecule contains two hydrogen atoms and one oxygen atom.",
      scheduledFor: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      xpReward: 20,
      createdBy: admin._id
    },
    {
      title: "Ratio Reasoning",
      prompt: "If 3 pens cost 45, what will 7 pens cost at the same rate?",
      category: "Aptitude",
      topic: "Ratios",
      difficulty: "Medium",
      options: ["95", "100", "105", "110"],
      correctAnswer: "105",
      explanation: "One pen costs 15, so seven pens cost 7 x 15 = 105.",
      scheduledFor: today,
      xpReward: 30,
      createdBy: admin._id
    }
  ]);

  console.log("Seed complete. Admin login: admin@qotd.local / Admin123!");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
