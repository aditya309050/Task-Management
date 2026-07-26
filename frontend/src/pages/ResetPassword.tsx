import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";
import { Lock, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export const ResetPassword: React.FC = () => {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Password reset token is missing. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !token) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 6 characters and contain one uppercase, one lowercase letter, and one number.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setIsSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center text-green-500">
          <CheckCircle className="h-14 w-14" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Password Reset Successful</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your credentials have been updated. You can now log in using your new password.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex w-full justify-center rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 transition"
        >
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Password</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Enter and confirm your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            New Password
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              required
              disabled={!token}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              required
              disabled={!token}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !token}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
        </button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};
