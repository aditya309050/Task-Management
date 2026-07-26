import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Client-side password validation check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 6 characters and contain one uppercase, one lowercase letter, and one number.");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.signup({ name, email, password });
      signup(data.token, data.user);
      toast.success("Account created! Welcome to TaskFlow.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create a New Account</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Get started with TaskFlow by signing up today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Full Name
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <UserIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Email Address
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Password
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Must be at least 6 characters with an uppercase letter, lowercase letter, and a number.
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign Up
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-350"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};
