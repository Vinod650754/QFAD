import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Skeleton from "../components/ui/Skeleton";

export default function Leaderboard() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get("/api/users/leaderboard").then(({ data }) => setUsers(data.users));
  }, []);

  if (!users) return <Skeleton rows={6} />;

  return (
    <section className="panel">
      <h1 className="mb-5 text-3xl font-black">Leaderboard</h1>
      <div className="space-y-3">
        {users.map((user, index) => (
          <div key={user._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg text-sm font-black text-white" style={{ background: user.avatarColor }}>
                {index === 0 ? <Crown size={18} /> : index + 1}
              </div>
              <div>
                <p className="font-black">{user.name}</p>
                <p className="text-xs text-slate-500">{user.badges?.length || 0} badges</p>
              </div>
            </div>
            <p className="text-xl font-black text-mint">{user.xp} XP</p>
          </div>
        ))}
      </div>
    </section>
  );
}
