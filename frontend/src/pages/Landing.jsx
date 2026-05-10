import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="app-shell min-h-screen text-ink dark:text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-white">Q</span>
          Question of the Day
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" to="/login">Login</Link>
          <Link className="btn-primary" to="/signup">Start</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <p className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-mint shadow-sm dark:bg-slate-900">
            Daily learning that actually sticks
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">Question of the Day</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            One focused question every day, with streaks, XP, history, badges, and a calm dashboard for steady progress.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/signup">Create free account <ArrowRight size={18} /></Link>
            <Link className="btn-secondary" to="/login">I already have one</Link>
          </div>
        </motion.section>
        <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Today</p>
              <h2 className="text-2xl font-black">Array Fundamentals</h2>
            </div>
            <Sparkles className="text-sun" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            Which method adds one or more elements to the end of a JavaScript array?
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Mini label="Streaks" value="12 days" icon={Flame} />
            <Mini label="XP" value="+25" icon={Sparkles} />
            <Mini label="Badges" value="7" icon={BadgeCheck} />
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function Mini({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <Icon className="mb-3 text-mint" size={20} />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}
