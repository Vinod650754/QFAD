import fs from "fs/promises";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

dotenv.config();

const file = process.argv[2];

if (!file) {
  console.error("Usage: node src/scripts/importDataset.js <dataset.json>");
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("Create or seed an admin user before importing a dataset");

  const rows = JSON.parse(await fs.readFile(file, "utf8"));
  const docs = rows.map((row) => ({
    title: row.title || row.question?.slice(0, 64) || "Imported Question",
    prompt: row.prompt || row.question,
    category: row.category || "GK",
    topic: row.topic || row.subject || row.category || "General",
    difficulty: row.difficulty || "Easy",
    options: row.options || [],
    correctAnswer: row.correctAnswer || row.correct_answer || row.answer,
    explanation: row.explanation || "",
    scheduledFor: row.scheduledFor ? new Date(row.scheduledFor) : new Date(),
    xpReward: row.xpReward || 20,
    source: row.source || "dataset",
    createdBy: admin._id
  }));

  const inserted = await Question.insertMany(docs);
  console.log(`Imported ${inserted.length} questions`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
