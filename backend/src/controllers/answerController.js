import { body } from "express-validator";
import Answer from "../models/Answer.js";
import Notification from "../models/Notification.js";
import Question from "../models/Question.js";
import Streak from "../models/Streak.js";
import User from "../models/User.js";
import XpHistory from "../models/XpHistory.js";
import { isYesterdayUtc, startOfUtcDay } from "../utils/date.js";

export const answerRules = [
  body("questionId").isMongoId().withMessage("Valid questionId is required"),
  body("answer").trim().notEmpty().withMessage("Answer is required")
];

export const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer, timeSpentSeconds } = req.body;
    const question = await Question.findById(questionId).select("+correctAnswer");
    if (!question) return res.status(404).json({ message: "Question not found" });

    const existing = await Answer.findOne({ user: req.user._id, question: questionId });
    if (existing) return res.status(409).json({ message: "Question already answered" });

    const isCorrect = normalize(answer) === normalize(question.correctAnswer);
    const xpEarned = isCorrect ? question.xpReward : Math.ceil(question.xpReward / 4);

    const savedAnswer = await Answer.create({
      user: req.user._id,
      question: questionId,
      answer,
      isCorrect,
      xpEarned,
      timeSpentSeconds
    });

    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    awardBadges(user);
    await user.save();

    const streak = await updateStreak(req.user._id);
    await XpHistory.create({
      user: req.user._id,
      points: xpEarned,
      reason: isCorrect ? "Correct daily answer" : "Daily participation",
      question: questionId
    });
    await Notification.create({
      user: req.user._id,
      title: isCorrect ? "Correct answer" : "Answer submitted",
      message: `You earned ${xpEarned} XP.`,
      type: isCorrect ? "success" : "info"
    });
    const [recentXp, notifications, answerCount] = await Promise.all([
      XpHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10),
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
      Answer.countDocuments({ user: req.user._id })
    ]);

    res.status(201).json({
      answer: savedAnswer,
      isCorrect,
      xpEarned,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
      streak,
      badges: user.badges,
      profile: {
        user,
        streak,
        recentXp,
        notifications,
        answerCount
      }
    });
  } catch (err) {
    next(err);
  }
};

export const history = async (req, res, next) => {
  try {
    const answers = await Answer.find({ user: req.user._id })
      .populate("question", "title category difficulty scheduledFor")
      .sort({ createdAt: -1 });
    res.json({ answers });
  } catch (err) {
    next(err);
  }
};

const updateStreak = async (userId) => {
  const today = startOfUtcDay();
  const streak = (await Streak.findOne({ user: userId })) || new Streak({ user: userId });

  if (!streak.lastAnsweredDate) {
    streak.current = 1;
  } else if (startOfUtcDay(streak.lastAnsweredDate).getTime() === today.getTime()) {
    return streak;
  } else if (isYesterdayUtc(streak.lastAnsweredDate)) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }

  streak.lastAnsweredDate = today;
  streak.longest = Math.max(streak.longest, streak.current);
  await streak.save();
  return streak;
};

const awardBadges = (user) => {
  const owned = new Set(user.badges.map((badge) => badge.key));
  const badges = [
    { key: "first_xp", label: "First XP", ok: user.xp > 0 },
    { key: "hundred_club", label: "100 XP Club", ok: user.xp >= 100 },
    { key: "five_hundred", label: "500 XP Spark", ok: user.xp >= 500 }
  ];

  badges.forEach((badge) => {
    if (badge.ok && !owned.has(badge.key)) user.badges.push({ key: badge.key, label: badge.label });
  });
};

const normalize = (value) => String(value).trim().toLowerCase();
