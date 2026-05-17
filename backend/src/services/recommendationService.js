import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import Streak from "../models/Streak.js";

const difficultyScore = { Easy: 1, Medium: 2, Hard: 3 };
const scoreDifficulty = { 1: "Easy", 2: "Medium", 3: "Hard" };

export const buildUserFeatures = async (userId) => {
  const [answers, streak] = await Promise.all([
    Answer.find({ user: userId }).populate("question", "category topic difficulty").lean(),
    Streak.findOne({ user: userId }).lean()
  ]);

  const total = answers.length;
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const accuracy = total ? correct / total : 0;
  const avgTime = total
    ? answers.reduce((sum, answer) => sum + (answer.timeSpentSeconds || 0), 0) / total
    : 0;
  const solvedDifficulty = total
    ? answers.reduce((sum, answer) => sum + (difficultyScore[answer.question?.difficulty] || 1), 0) / total
    : 1;

  const topicStats = {};
  answers.forEach((answer) => {
    const topic = answer.question?.topic || answer.question?.category || "General";
    topicStats[topic] ||= { attempted: 0, correct: 0 };
    topicStats[topic].attempted += 1;
    if (answer.isCorrect) topicStats[topic].correct += 1;
  });

  const weakTopics = Object.entries(topicStats)
    .map(([topic, stats]) => ({ topic, accuracy: stats.correct / stats.attempted }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((item) => item.topic);

  return {
    accuracy,
    weakTopics,
    avgTime,
    solvedDifficulty,
    streak: streak?.current || 0,
    topicStats
  };
};

export const recommendQuestion = async (userId) => {
  const features = await buildUserFeatures(userId);
  const answeredIds = await Answer.distinct("question", { user: userId });
  const candidates = await Question.find({
    _id: { $nin: answeredIds },
    isPublished: true,
    type: "adaptive",
    scheduledFor: { $lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }
  }).lean();

  if (!candidates.length) return { question: null, features, reason: "No unanswered adaptive questions" };

  const targetDifficulty = chooseDifficulty(features);
  const targetTopic = features.weakTopics?.[0] || "General";
  const ranked = rankCandidates(candidates, { topic: targetTopic, difficulty: targetDifficulty }, features);

  return {
    question: ranked[0]?.question || candidates[0],
    features,
    reason: `Recommended ${targetDifficulty} difficulty on ${targetTopic} based on your performance`
  };
};

const rankCandidates = (candidates, target, features) =>
  candidates
    .map((question) => ({
      question,
      score:
        (question.topic === target.topic ? 5 : 0) +
        (features.weakTopics.includes(question.topic) ? 3 : 0) +
        (question.difficulty === target.difficulty ? 4 : 0) +
        (new Date(question.scheduledFor) <= new Date() ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score);

const chooseDifficulty = (features) => {
  const current = Math.round(features.solvedDifficulty || 1);
  if (features.accuracy >= 0.8 && features.streak >= 2) return scoreDifficulty[Math.min(3, current + 1)];
  if (features.accuracy < 0.45) return scoreDifficulty[Math.max(1, current - 1)];
  return scoreDifficulty[current] || "Easy";
};
