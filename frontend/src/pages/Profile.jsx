import { BadgeCheck, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", avatarColor: "#14b8a6" });

  useEffect(() => {
    api.get("/api/users/profile").then(({ data }) => {
      setProfile(data);
      setForm({ name: data.user.name, avatarColor: data.user.avatarColor || "#14b8a6" });
    });
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put("/api/users/profile", form);
      setUser({ ...user, ...data.user });
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!profile) return <Skeleton rows={5} />;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.7fr_0.3fr]">
      <section className="panel">
        <h1 className="mb-5 text-3xl font-black">Profile</h1>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Avatar color</label>
            <input className="field h-10" type="color" value={form.avatarColor} onChange={(e) => setForm({ ...form, avatarColor: e.target.value })} />
          </div>
          <button className="btn-primary sm:col-span-2"><Save size={18} /> Save</button>
        </form>
      </section>
      <aside className="panel">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><BadgeCheck className="text-mint" /> Badges</h2>
        <div className="space-y-2">
          {profile.user.badges?.length ? profile.user.badges.map((badge) => (
            <div key={badge.key} className="rounded-lg bg-slate-50 p-3 font-semibold dark:bg-slate-800">{badge.label}</div>
          )) : <p className="text-sm text-slate-500">Badges appear as you earn XP.</p>}
        </div>
      </aside>
    </div>
  );
}
