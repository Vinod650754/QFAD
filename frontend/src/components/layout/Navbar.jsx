import { BookOpen, Brain, History, Home, LogOut, Menu, Moon, Shield, Sun, Trophy, User } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/daily", label: "Daily", icon: BookOpen },
  { to: "/adaptive", label: "Adaptive", icon: Brain },
  { to: "/topics", label: "Topics", icon: Brain },
  { to: "/history", label: "History", icon: History },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-white">Q</span>
          <span>Question Daily</span>
        </NavLink>
        <nav className="hidden items-center gap-1 lg:flex">
          <NavItems user={user} />
        </nav>
        <div className="flex items-center gap-2">
          <button className="btn-secondary p-2" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-secondary hidden p-2 sm:inline-flex" onClick={doLogout} aria-label="Log out">
            <LogOut size={18} />
          </button>
          <button className="btn-secondary p-2 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
            <Menu size={18} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 lg:hidden">
          <div className="grid gap-2">
            <NavItems user={user} onClick={() => setOpen(false)} />
            <button className="btn-secondary justify-start" onClick={doLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavItems({ user, onClick }) {
  const fullLinks = user?.role === "admin" ? [...links, { to: "/admin", label: "Admin", icon: Shield }] : links;
  return fullLinks.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `btn px-3 ${isActive ? "bg-ink text-white dark:bg-white dark:text-ink" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  ));
}
