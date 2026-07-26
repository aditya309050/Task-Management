import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Menu, Moon, Sun, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      {/* Left items */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:block">
          Welcome back, <span className="font-semibold text-slate-800 dark:text-white">{user?.name}</span>
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4">
        {/* Light/Dark mode toggler */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 animate-pulse" />
          ) : (
            <Sun className="h-5 w-5 animate-spin-slow text-amber-500" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User profile dropdown link */}
        <Link to="/profile" className="group flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
          </div>
          {getAvatarUrl(user?.avatarUrl) ? (
            <img
              src={getAvatarUrl(user?.avatarUrl)!}
              alt={user?.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-850 shadow-sm"
              onError={(e) => {
                // Remove broken image source to trigger fallback initials
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-400 shadow-sm border border-brand-200 dark:border-brand-900">
              {user ? getInitials(user.name) : <UserIcon className="h-4 w-4" />}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
};
