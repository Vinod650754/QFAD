import { buildUserFeatures, recommendQuestion } from "../services/recommendationService.js";

export const nextQuestion = async (req, res, next) => {
  try {
    const recommendation = await recommendQuestion(req.user._id);
    if (!recommendation.question) {
      return res.json({
        ...recommendation,
        question: null,
        message: recommendation.reason || "No adaptive question available."
      });
    }
    res.json(recommendation);
  } catch (err) {
    next(err);
  }
};

export const topicProgress = async (req, res, next) => {
  try {
    const features = await buildUserFeatures(req.user._id);
    const topics = Object.entries(features.topicStats).map(([topic, stats]) => ({
      topic,
      attempted: stats.attempted,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.attempted) * 100)
    }));
    res.json({ topics, weakTopics: features.weakTopics, features });
  } catch (err) {
    next(err);
  }
};
