import { Brain, Target } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Skeleton from "../components/ui/Skeleton";

export default function TopicProgress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/recommendations/topics").then(({ data }) => setData(data));
  }, []);

  if (!data) return <Skeleton rows={6} />;

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="mb-5 flex items-center gap-3">
          <Brain className="text-mint" />
          <div>
            <p className="text-sm text-slate-500">Adaptive learning</p>
            <h1 className="text-3xl font-black">Topic Progress</h1>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Accuracy" value={`${Math.round(data.features.accuracy * 100)}%`} />
          <Metric label="Average time" value={`${Math.round(data.features.avgTime || 0)}s`} />
          <Metric label="Current level" value={difficultyLabel(data.features.solvedDifficulty)} />
        </div>
      </section>
      <section className="panel">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Target size={20} /> Topic analytics</h2>
        <div className="space-y-4">
          {data.topics.length ? data.topics.map((topic) => (
            <div key={topic.topic}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">{topic.topic}</span>
                <span>{topic.correct}/{topic.attempted} correct</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-3 rounded-full bg-mint" style={{ width: `${topic.accuracy}%` }} />
              </div>
            </div>
          )) : <p className="text-slate-500">Answer questions to unlock topic analytics.</p>}
        </div>
      </section>
      <section className="panel">
        <p className="text-sm text-slate-500">Weak topics</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.weakTopics.length ? data.weakTopics.map((topic) => (
            <span key={topic} className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{topic}</span>
          )) : <span className="text-sm text-slate-500">No weak topic detected yet.</span>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

const difficultyLabel = (value) => {
  if (value >= 2.5) return "Hard";
  if (value >= 1.5) return "Medium";
  return "Easy";
};
