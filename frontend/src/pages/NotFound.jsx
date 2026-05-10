import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="app-shell grid min-h-screen place-items-center px-4 text-center text-ink dark:text-slate-100">
      <div>
        <p className="text-sm font-semibold text-mint">404</p>
        <h1 className="mt-2 text-4xl font-black">Page not found</h1>
        <Link className="btn-primary mt-6" to="/dashboard">Back to dashboard</Link>
      </div>
    </div>
  );
}
