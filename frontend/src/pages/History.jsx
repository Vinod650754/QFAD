import { useEffect, useState } from "react";
import api from "../api/client";
import Skeleton from "../components/ui/Skeleton";
import { useAppData } from "../context/AppDataContext";

export default function History() {
  const [answers, setAnswers] = useState(null);
  const [error, setError] = useState("");
  const { refreshKey } = useAppData();

  useEffect(() => {
    let alive = true;
    setError("");
    api
      .get("/api/answers/history")
      .then(({ data }) => {
        if (alive) setAnswers(data.answers);
      })
      .catch((loadError) => {
        if (alive) setError(loadError.message || "Unable to load history");
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  if (error) return <section className="panel text-coral">{error}</section>;
  if (!answers) return <Skeleton rows={5} />;

  return (
    <section className="panel">
      <h1 className="mb-5 text-3xl font-black">Previous Questions</h1>
      <div className="space-y-3">
        {answers.length ? answers.map((item) => (
          <div key={item._id} className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center">
            <div>
              <p className="font-black">{item.question?.title}</p>
              <p className="text-sm text-slate-500">{item.question?.category} / {item.question?.difficulty}</p>
            </div>
            <span className={`rounded-lg px-3 py-1 text-sm font-bold ${item.isCorrect ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral"}`}>
              {item.isCorrect ? "Correct" : "Submitted"} / +{item.xpEarned} XP
            </span>
          </div>
        )) : <p className="text-slate-500">No answers submitted yet.</p>}
      </div>
    </section>
  );
}
