import Answer from "../models/Answer.js";
import Notification from "../models/Notification.js";
import Question from "../models/Question.js";
import Streak from "../models/Streak.js";
import User from "../models/User.js";

export const analytics = async (req, res, next) => {
  try {
    const [users, questions, answers, correctAnswers] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      Answer.countDocuments({ isCorrect: true })
    ]);

    const categoryStats = await Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totals: {
        users,
        questions,
        answers,
        accuracy: answers ? Math.round((correctAnswers / answers) * 100) : 0
      },
      categoryStats
    });
  } catch (err) {
    next(err);
  }
};

export const users = async (req, res, next) => {
  try {
    const list = await User.find().sort({ createdAt: -1 }).select("-resetPasswordToken");
    res.json({ users: list });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updates = {};
    ["name", "role", "avatarColor", "isActive"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const resetStreak = async (req, res, next) => {
  try {
    const streak = await Streak.findOneAndUpdate(
      { user: req.params.id },
      { current: 0, lastAnsweredDate: null },
      { new: true, upsert: true }
    );
    await Notification.create({
      user: req.params.id,
      title: "Streak reset",
      message: "An admin reset your current streak.",
      type: "warning"
    });
    res.json({ streak });
  } catch (err) {
    next(err);
  }
};

export const deleteUserContent = async (req, res, next) => {
  try {
    const answers = await Answer.deleteMany({ user: req.params.id });
    res.json({ message: "User answers removed", deleted: answers.deletedCount });
  } catch (err) {
    next(err);
  }
};
