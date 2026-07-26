import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";
import { Mail, Loader2, ArrowLeft, Key } from "lucide-react";
import toast from "react-hot-toast";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(""); // Holds reset token for sandbox testing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setDevToken("");
    try {
      const data = await authApi.forgotPassword(email);
      toast.success("Reset link has been generated!");
      
      // In development mode, retrieve the reset token from API response to help manual test
      if (data.token) {
        setDevToken(data.token);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to trigger recovery email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recover Password</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Enter your email to receive a password reset token
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Reset Link"}
        </button>
      </form>

      {/* Sandbox helper block */}
      {devToken && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Key className="h-4 w-4" />
            Sandbox Developer Mode
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Since email transport is mocked on local servers, we returned the reset token directly to help you test:
          </p>
          <Link
            to={`/reset-password?token=${devToken}`}
            className="inline-flex w-full justify-center rounded-lg bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
          >
            Click here to Reset Password
          </Link>
        </div>
      )}

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
