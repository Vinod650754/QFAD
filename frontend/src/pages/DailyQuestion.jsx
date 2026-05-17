import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import Skeleton from "../components/ui/Skeleton";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function DailyQuestion({ mode = "daily" }) {
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const { refreshAppData } = useAppData();

  useEffect(() => {
    let alive = true;
    setData(null);
    setError("");
    setAnswer("");
    setResult(null);

    const endpoint = mode === "adaptive" ? "/api/recommendations/next" : "/api/questions/today";
    api
      .get(endpoint)
      .then(({ data }) => {
        if (!alive) return;
        const nextData =
          mode === "adaptive"
            ? { question: data.question, recommendationReason: data.reason, answered: false }
            : data;
        setData(nextData);
        if (nextData.question) setSeconds(nextData.question.timeLimitSeconds || 300);
      })
      .catch((loadError) => {
        if (!alive) return;
        const message =
          mode === "daily"
            ? "No question available today."
            : loadError.message || "No adaptive question available.";
        setError(message);
        toast.error(message);
      });
    return () => {
      alive = false;
    };
  }, [mode]);

  useEffect(() => {
    if (!seconds || result || data?.answered) return undefined;
    const id = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds, result, data?.answered]);

  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);

  if (!data && !error) return <Skeleton rows={6} />;
  if (error || !data?.question) {
    return (
      <section className="panel text-center">
        <p className="text-sm font-semibold text-mint">{mode === "adaptive" ? "Adaptive" : "Today"}</p>
        <h1 className="mt-2 text-3xl font-black">
          {mode === "adaptive" ? "No adaptive question available." : "No question available today."}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          {mode === "adaptive"
            ? "New adaptive questions will appear here once they are imported or generated."
            : "An admin can schedule a daily question for today from the admin panel."}
        </p>
      </section>
    );
  }
  const { question } = data;

  const submit = async (event) => {
    event.preventDefault();
    try {
      const elapsed = (question.timeLimitSeconds || 300) - seconds;
      const response = await api.post("/api/answers", { questionId: question._id, answer, timeSpentSeconds: elapsed });
      setResult(response.data);
      setData((current) => current ? { ...current, answered: true, answer: response.data.answer } : current);
      setUser((user) =>
        user
          ? { ...user, xp: response.data.profile?.user?.xp ?? user.xp + response.data.xpEarned, badges: response.data.badges }
          : user
      );
      refreshAppData(response.data.profile);
      if (response.data.isCorrect) confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
      toast.success(`+${response.data.xpEarned} XP earned`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.72fr_0.28fr]">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-mint">{question.category} / {question.difficulty}</p>
            <h1 className="text-3xl font-black">{mode === "adaptive" ? "Adaptive Practice" : "Today's Question"}</h1>
            <p className="mt-1 text-lg font-semibold">{question.title}</p>
            {data.recommendationReason && <p className="mt-1 text-sm text-slate-500">{data.recommendationReason}</p>}
          </div>
          <div className="btn-secondary"><Clock size={18} /> {time}</div>
        </div>
        <p className="rounded-lg bg-slate-50 p-4 text-lg dark:bg-slate-800">{question.prompt}</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          {question.options?.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => (
                <button key={option} type="button" onClick={() => setAnswer(option)} className={`btn-secondary justify-start ${answer === option ? "ring-4 ring-mint/20" : ""}`}>
                  {option}
                </button>
              ))}
            </div>
          )}
          <textarea className="field min-h-28" placeholder="Your answer" required value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={data.answered || result} />
          <button className="btn-primary" disabled={data.answered || result || seconds === 0}>Submit answer</button>
        </form>
        {(result || data.answer) && (
          <div className="mt-5 rounded-lg border border-mint/30 bg-mint/10 p-4">
            <p className="font-black">{result?.isCorrect || data.answer?.isCorrect ? "Correct work." : "Good attempt."}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result?.explanation || "You already answered this one."}</p>
          </div>
        )}
      </motion.section>
      <aside className="space-y-4">
        <div className="panel">
          <Sparkles className="mb-3 text-sun" />
          <p className="text-sm text-slate-500">Reward</p>
          <p className="text-3xl font-black">{question.xpReward} XP</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">Motivation</p>
          <p className="mt-2 font-semibold">"{question.quote?.text}"</p>
          <p className="mt-1 text-sm text-slate-500">- {question.quote?.author}</p>
        </div>
      </aside>
    </div>
  );
}
