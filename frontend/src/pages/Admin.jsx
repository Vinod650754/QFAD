import { BarChart3, Plus, RotateCcw, Upload, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import StatCard from "../components/ui/StatCard";
import Skeleton from "../components/ui/Skeleton";

const blankQuestion = {
  title: "",
  prompt: "",
  category: "Coding",
  topic: "General",
  difficulty: "Easy",
  options: "",
  correctAnswer: "",
  explanation: "",
  scheduledFor: new Date().toISOString().slice(0, 10),
  xpReward: 20,
  timeLimitSeconds: 300
};

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(blankQuestion);
  const [dataset, setDataset] = useState(null);

  const load = () => {
    Promise.all([api.get("/admin/analytics"), api.get("/admin/users"), api.get("/questions")]).then(([a, u, q]) => {
      setAnalytics(a.data);
      setUsers(u.data.users);
      setQuestions(q.data.questions);
    });
  };

  useEffect(load, []);

  const createQuestion = async (event) => {
    event.preventDefault();
    try {
      await api.post("/questions", {
        ...form,
        options: form.options.split(",").map((option) => option.trim()).filter(Boolean),
        scheduledFor: new Date(form.scheduledFor)
      });
      setForm(blankQuestion);
      toast.success("Question scheduled");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetStreak = async (id) => {
    await api.post(`/admin/users/${id}/reset-streak`);
    toast.success("Streak reset");
  };

  const uploadDataset = async (event) => {
    event.preventDefault();
    if (!dataset) return toast.error("Choose a JSON or CSV dataset first");
    const body = new FormData();
    body.append("dataset", dataset);
    try {
      const { data } = await api.post("/datasets/import", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`Imported ${data.imported} questions`);
      setDataset(null);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!analytics) return <Skeleton rows={6} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Operations</p>
        <h1 className="text-4xl font-black">Admin Panel</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Users" value={analytics.totals.users} />
        <StatCard label="Questions" value={analytics.totals.questions} accent="bg-sun" />
        <StatCard label="Answers" value={analytics.totals.answers} accent="bg-coral" />
        <StatCard label="Accuracy" value={`${analytics.totals.accuracy}%`} />
      </div>
      <section className="panel">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Plus size={20} /> Schedule Question</h2>
        <form onSubmit={createQuestion} className="grid gap-3 lg:grid-cols-3">
          <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["Coding", "Aptitude", "GK", "English", "Science"].map((x) => <option key={x}>{x}</option>)}</select>
          <select className="field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>{["Easy", "Medium", "Hard"].map((x) => <option key={x}>{x}</option>)}</select>
          <input className="field" placeholder="Topic" value={form.topic || ""} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          <textarea className="field lg:col-span-3" placeholder="Prompt" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} required />
          <input className="field" placeholder="Options comma separated" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
          <input className="field" placeholder="Correct answer" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} required />
          <input className="field" type="date" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} required />
          <textarea className="field lg:col-span-3" placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          <button className="btn-primary lg:col-span-3">Create question</button>
        </form>
      </section>
      <section className="panel">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Upload size={20} /> Dataset Upload</h2>
        <form onSubmit={uploadDataset} className="flex flex-col gap-3 sm:flex-row">
          <input className="field" type="file" accept=".json,.csv" onChange={(e) => setDataset(e.target.files?.[0] || null)} />
          <button className="btn-primary">Import dataset</button>
        </form>
        <p className="mt-3 text-sm text-slate-500">Supports Kaggle/HuggingFace style JSON or CSV with category, topic, difficulty, options, answer, and explanation fields.</p>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Users size={20} /> Users</h2>
          <div className="space-y-2">
            {users.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.email}</p></div>
                <button className="btn-secondary p-2" onClick={() => resetStreak(item._id)} aria-label="Reset streak"><RotateCcw size={16} /></button>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><BarChart3 size={20} /> Scheduled Questions</h2>
          <div className="space-y-2">
            {questions.map((item) => (
              <div key={item._id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-slate-500">{item.category} / {new Date(item.scheduledFor).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
