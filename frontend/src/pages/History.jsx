import { useEffect, useState } from "react";
import api from "../api/client";
import Skeleton from "../components/ui/Skeleton";

export default function History() {
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    api.get("/answers/history").then(({ data }) => setAnswers(data.answers));
  }, []);

  if (!answers) return <Skeleton rows={5} />;

  return (
    <section className="panel">
      <h1 className="mb-5 text-3xl font-black">Previous Questions</h1>
      <div className="space-y-3">
        {answers.map((item) => (
          <div key={item._id} className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center">
            <div>
              <p className="font-black">{item.question?.title}</p>
              <p className="text-sm text-slate-500">{item.question?.category} / {item.question?.difficulty}</p>
            </div>
            <span className={`rounded-lg px-3 py-1 text-sm font-bold ${item.isCorrect ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral"}`}>
              {item.isCorrect ? "Correct" : "Submitted"} / +{item.xpEarned} XP
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
