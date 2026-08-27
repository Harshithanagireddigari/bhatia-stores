"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to process reset request.");
        return;
      }

      setSubmitted(true);
      toast.success("Password reset instructions dispatched!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-xl dark:border-stone-800 dark:bg-stone-900">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Account Recovery
          </span>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Enter your email to receive a secure, single-use password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
            <h3 className="mt-3 font-serif text-base font-bold">Reset Instructions Dispatched</h3>
            <p className="mt-1.5 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure password reset link has been generated and dispatched. Please check your inbox and spam folder.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Registered Email Address *
              </label>
              <div className="relative mt-1.5">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition active:scale-98 disabled:opacity-50 dark:bg-stone-800 dark:hover:bg-purple-800"
            >
              {loading ? (
                <span>Generating reset link...</span>
              ) : (
                <>
                  <span>Send Password Reset Link</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900 hover:underline dark:text-amber-400"
              >
                <ArrowLeft size={13} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
