import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FolderKanban } from "lucide-react";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Redirect to dashboard if session is active
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/35">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Welcome to TaskFlow
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Collaborative task management for modern teams
          </p>
        </div>

        {/* Card containing child forms */}
        <div className="glass-panel rounded-2xl bg-white p-8 shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
          {children}
        </div>
      </div>
    </div>
  );
};
