"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, RefreshCw, ShieldCheck, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
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
      toast.error("Could not load security verification");
    } finally {
      setRefreshingCaptcha(false);
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          captchaAnswer,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
        loadCaptcha();
        return;
      }

      toast.success("Account created successfully! Welcome to Bhatia Stores.");
      router.push("/account");
      router.refresh();
    } catch {
      toast.error("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-xl dark:border-stone-800 dark:bg-stone-900">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Join Bhatia Stores
          </span>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Create Customer Account
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Enjoy streamlined checkout, freight tracking, and exclusive showroom quotes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Full Name *
            </label>
            <div className="relative mt-1.5">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Email Address *
            </label>
            <div className="relative mt-1.5">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Phone Number (WhatsApp)
            </label>
            <div className="relative mt-1.5">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Password *
            </label>
            <div className="relative mt-1.5">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Confirm Password *
            </label>
            <div className="relative mt-1.5">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          {/* Captcha */}
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

          <button
            type="submit"
            disabled={loading || !captchaQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition active:scale-98 disabled:opacity-50 dark:bg-stone-800 dark:hover:bg-purple-800"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-purple-900 hover:underline dark:text-amber-400">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
