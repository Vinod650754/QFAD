const categoryMap = [
  { test: /computer|technology|programming|code|software/i, category: "Coding" },
  { test: /science|nature|chemistry|physics|biology/i, category: "Science" },
  { test: /english|language|literature|word/i, category: "English" },
  { test: /math|logic|reasoning|aptitude/i, category: "Aptitude" }
];

export const normalizeQuestionRow = (row) => {
  const question = decodeText(row.question || row.prompt || "");
  const answer = decodeText(row.correct_answer || row.correctAnswer || row.answer || "");
  const incorrect = row.incorrect_answers || row.incorrectAnswers || [];
  const options = Array.isArray(row.options)
    ? row.options.map(decodeText)
    : [...incorrect, answer].map(decodeText).filter(Boolean);

  return {
    title: decodeText(row.title || question.slice(0, 70) || "Imported Question"),
    question,
    options: unique(options),
    answer,
    explanation: decodeText(row.explanation || `Correct answer: ${answer}`),
    topic: normalizeTopic(row.topic || row.category || "General"),
    category: normalizeCategory(row.category || row.topic || "GK"),
    difficulty: normalizeDifficulty(row.difficulty),
    source: row.source || "opentdb"
  };
};

export const cleanQuestions = (rows) => {
  const seen = new Set();
  return rows
    .map(normalizeQuestionRow)
    .filter((item) => item.question && item.answer && item.options.length >= 2)
    .filter((item) => item.options.includes(item.answer))
    .filter((item) => {
      const key = item.question.toLowerCase().replace(/\W+/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizeCategory = (value) => {
  const match = categoryMap.find((item) => item.test.test(value));
  return match?.category || "GK";
};

const normalizeTopic = (value) =>
  String(value)
    .replace(/^Science:\s*/i, "")
    .replace(/^Entertainment:\s*/i, "")
    .trim() || "General";

const normalizeDifficulty = (value = "Easy") => {
  const text = String(value).toLowerCase();
  if (text.startsWith("h")) return "Hard";
  if (text.startsWith("m")) return "Medium";
  return "Easy";
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const decodeText = (value) =>
  String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
