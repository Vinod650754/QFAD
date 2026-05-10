import { motion } from "framer-motion";
import { Bell, BookOpen, Flame, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/ui/StatCard";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/api/users/profile"), api.get("/api/users/notifications")]).then(([p, n]) => {
      setProfile(p.data);
      setNotifications(n.data.notifications);
    });
  }, []);

  if (!profile) return <Skeleton rows={5} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
          <h1 className="text-4xl font-black">{user.name}</h1>
        </div>
        <a className="btn-primary" href="/daily"><BookOpen size={18} /> Today's question</a>
      </motion.div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total XP" value={profile.user.xp} />
        <StatCard label="Current streak" value={`${profile.streak?.current || 0} days`} accent="bg-coral" />
        <StatCard label="Answers submitted" value={profile.answerCount} accent="bg-sun" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Sparkles className="text-sun" /> Recent XP</h2>
          <div className="space-y-3">
            {profile.recentXp.length ? profile.recentXp.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <span>{item.reason}</span>
                <span className="font-black text-mint">+{item.points}</span>
              </div>
            )) : <p className="text-slate-500">No XP yet. Today is a fine day to begin.</p>}
          </div>
        </section>
        <section className="panel">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Bell className="text-mint" /> Notifications</h2>
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="panel flex items-center gap-3">
        <Flame className="text-coral" />
        <p className="font-semibold">Daily quote: Small daily wins compound into mastery.</p>
      </div>
    </div>
  );
}
