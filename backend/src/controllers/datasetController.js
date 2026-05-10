import fs from "fs/promises";
import Question from "../models/Question.js";

export const importDataset = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Dataset file is required" });

    const raw = await fs.readFile(req.file.path, "utf8");
    const rows = req.file.originalname.endsWith(".csv") ? parseCsv(raw) : JSON.parse(raw);
    const normalized = rows.map((row) => normalizeQuestion(row, req.user._id));
    const inserted = await Question.insertMany(normalized, { ordered: false });
    await fs.unlink(req.file.path).catch(() => {});

    res.status(201).json({ imported: inserted.length });
  } catch (err) {
    next(err);
  }
};

const normalizeQuestion = (row, userId) => ({
  title: row.title || row.question?.slice(0, 64) || "Imported Question",
  prompt: row.prompt || row.question,
  category: row.category || "GK",
  topic: row.topic || row.subject || row.category || "General",
  difficulty: normalizeDifficulty(row.difficulty),
  options: Array.isArray(row.options)
    ? row.options
    : String(row.options || "")
        .split("|")
        .map((option) => option.trim())
        .filter(Boolean),
  correctAnswer: row.correctAnswer || row.correct_answer || row.answer,
  explanation: row.explanation || "",
  scheduledFor: row.scheduledFor ? new Date(row.scheduledFor) : new Date(),
  xpReward: Number(row.xpReward || 20),
  source: row.source || "dataset",
  createdBy: userId
});

const normalizeDifficulty = (value = "Easy") => {
  const text = String(value).toLowerCase();
  if (text.startsWith("h")) return "Hard";
  if (text.startsWith("m")) return "Medium";
  return "Easy";
};

const parseCsv = (raw) => {
  const [headerLine, ...lines] = raw.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim());
  return lines.map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
};
