import { body, param } from "express-validator";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import { endOfUtcDay, startOfUtcDay } from "../utils/date.js";

export const questionRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("prompt").trim().notEmpty().withMessage("Prompt is required"),
  body("category").isIn(["Coding", "Aptitude", "GK", "English", "Science"]),
  body("topic").optional().trim().isLength({ min: 2 }).withMessage("Topic must be at least 2 characters"),
  body("difficulty").isIn(["Easy", "Medium", "Hard"]),
  body("correctAnswer").trim().notEmpty().withMessage("Correct answer is required"),
  body("scheduledFor").isISO8601().withMessage("scheduledFor must be a date")
];

export const getDailyQuestion = async (req, res, next) => {
  try {
    const today = new Date();
    const question = await Question.findOne({
      scheduledFor: { $gte: startOfUtcDay(today), $lte: endOfUtcDay(today) },
      isPublished: true
    }).sort({ scheduledFor: 1 });

    if (!question) return res.status(404).json({ message: "No question scheduled for today" });

    const existingAnswer = await Answer.findOne({ user: req.user._id, question: question._id });
    res.json({ question, answered: Boolean(existingAnswer), answer: existingAnswer });
  } catch (err) {
    next(err);
  }
};

export const listQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().sort({ scheduledFor: -1 }).select("+correctAnswer");
    res.json({ questions });
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select("+correctAnswer");
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    await Answer.deleteMany({ question: question._id });
    res.json({ message: "Question deleted" });
  } catch (err) {
    next(err);
  }
};

export const idRule = [param("id").isMongoId().withMessage("Invalid id")];
