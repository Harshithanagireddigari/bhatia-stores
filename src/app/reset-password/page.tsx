"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Password reset failed.");
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 text-center shadow-xl dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Invalid Reset Link</h2>
          <p className="mt-2 text-xs text-stone-500">
            This password reset link is invalid or has expired. Please request a new link from the forgot password page.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
          >
            Request Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-xl dark:border-stone-800 dark:bg-stone-900">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Secure Recovery
          </span>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Set New Password
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Please enter your new password to secure your Bhatia account.
          </p>
        </div>

        {success ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
            <h3 className="mt-3 font-serif text-base font-bold">Password Reset Complete</h3>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                New Password *
              </label>
              <div className="relative mt-1.5">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Confirm New Password *
              </label>
              <div className="relative mt-1.5">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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
                <span>Updating password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500">Loading reset form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
