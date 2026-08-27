"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);

  async function loadCaptcha() {
    setRefreshingCaptcha(true);
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const data = await res.json();
      setCaptchaQuestion(data.question || "");
      setCaptchaAnswer("");
    } catch {
      toast.error("Could not load security verification.");
    } finally {
      setRefreshingCaptcha(false);
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !captchaAnswer) {
      toast.error("Please enter email, password, and security answer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, captchaAnswer }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials or verification.");
        loadCaptcha();
        return;
      }

      toast.success("Signed in successfully!");
      if (data.user.role === "admin") {
        router.push(redirectUrl || "/admin");
      } else {
        router.push(redirectUrl || "/account");
      }
      router.refresh();
    } catch {
      toast.error("An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {/* Email */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Email Address *
        </label>
        <div className="relative mt-1.5">
          <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Password *
        </label>
        <div className="relative mt-1.5">
          <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>
      </div>

      {/* Human Verification CAPTCHA */}
      <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-4 dark:border-stone-700 dark:bg-stone-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            <ShieldCheck size={14} className="text-amber-600" />
            <span>Human Verification *</span>
          </div>
          <button
            type="button"
            onClick={loadCaptcha}
            disabled={refreshingCaptcha}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-900 hover:underline dark:text-amber-400 disabled:opacity-50"
          >
            <RefreshCw size={11} className={refreshingCaptcha ? "animate-spin" : ""} />
            <span>New question</span>
          </button>
        </div>

        <p className="mt-2 text-xs font-medium text-stone-600 dark:text-stone-300">
          {captchaQuestion || "Loading challenge..."}
        </p>

        <input
          type="number"
          inputMode="numeric"
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value)}
          required
          placeholder="Enter numeric answer"
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !captchaQuestion}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition active:scale-98 disabled:opacity-50 dark:bg-stone-800 dark:hover:bg-purple-800"
      >
        {loading ? (
          <span>Signing in...</span>
        ) : (
          <>
            <span>Sign In to Bhatia Account</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
