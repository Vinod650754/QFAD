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
  body("type").optional().isIn(["daily", "adaptive", "topic"]),
  body("source").optional().trim().isLength({ min: 2 }),
  body("correctAnswer").trim().notEmpty().withMessage("Correct answer is required"),
  body("scheduledFor").optional().isISO8601().withMessage("scheduledFor must be a date"),
  body("scheduledDate").optional().isISO8601().withMessage("scheduledDate must be a date")
];

export const getDailyQuestion = async (req, res, next) => {
  try {
    const today = new Date();
    const question = await Question.findOne({
      isPublished: true,
      type: "daily",
      $or: [
        { scheduledDate: { $gte: startOfUtcDay(today), $lte: endOfUtcDay(today) } },
        { scheduledFor: { $gte: startOfUtcDay(today), $lte: endOfUtcDay(today) } }
      ]
    }).sort({ scheduledFor: 1 });

    if (!question) {
      return res.json({
        question: null,
        answered: false,
        message: "No question available today."
      });
    }

    const existingAnswer = await Answer.findOne({ user: req.user._id, question: question._id });
    res.json({ question, answered: Boolean(existingAnswer), answer: existingAnswer });
  } catch (err) {
    next(err);
  }
};

export const listQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (["daily", "adaptive", "topic"].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    const questions = await Question.find(filter).sort({ scheduledFor: -1 }).select("+correctAnswer");
    res.json({ questions });
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const scheduledFor = req.body.scheduledFor || req.body.scheduledDate || new Date();
    const type = req.body.type || "daily";
    const source = req.body.source || (type === "daily" ? "admin" : "generated");
    const question = await Question.create({
      ...req.body,
      scheduledFor,
      scheduledDate: req.body.scheduledDate || scheduledFor,
      type,
      source,
      createdBy: req.user._id
    });
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
