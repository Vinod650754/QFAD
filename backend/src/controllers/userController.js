import Streak from "../models/Streak.js";
import User from "../models/User.js";
import Answer from "../models/Answer.js";
import Notification from "../models/Notification.js";
import XpHistory from "../models/XpHistory.js";

export const profile = async (req, res, next) => {
  try {
    const streak = await Streak.findOne({ user: req.user._id });
    const recentXp = await XpHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    const answerCount = await Answer.countDocuments({ user: req.user._id });
    res.json({ user: req.user, streak, recentXp, answerCount });
  } catch (err) {
    next(err);
  }
};

export const leaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .sort({ xp: -1, createdAt: 1 })
      .limit(50)
      .select("name xp avatarColor badges");
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const notifications = async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ notifications: items });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ message: "Notification updated" });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarColor } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatarColor },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
