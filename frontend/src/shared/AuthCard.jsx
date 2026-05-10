import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="app-shell grid min-h-screen place-items-center px-4 py-10 text-ink dark:text-slate-100">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-white">Q</span>
          Question of the Day
        </Link>
        <section className="panel">
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mb-6 mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
          {children}
        </section>
      </div>
    </div>
  );
}
