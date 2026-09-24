"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string): boolean => {
    // Indian phone number validation: +91 followed by 10 digits
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  async function loadCaptcha() {
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const data = await res.json();
      setCaptchaQuestion(data.question || "");
      setCaptchaAnswer("");
    } catch {
      toast.error("Could not load human verification");
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
    setLoading(true);
    
    // Validate phone number
    if (!validatePhone(form.phone)) {
      toast.error("Please enter a valid Indian phone number (+91 followed by 10 digits)");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaAnswer }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        loadCaptcha();
        return;
      }

      toast.success("Registered successfully!");
      const redirectUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/shop");
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Register</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create your Bhatia Stores account
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              pattern="^(\+91[\s-]?)?[6-9]\d{9}$"
              title="Enter valid Indian phone number (e.g., +91 9876543210 or 9876543210)"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="+91 9876543210"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: 10-digit Indian phone number (optionally starting with +91)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Human verification *
              </label>
              <button
                type="button"
                onClick={loadCaptcha}
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                New question
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {captchaQuestion || "Loading question..."}
            </p>
            <input
              type="number"
              inputMode="numeric"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Your answer"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaQuestion}
            className="w-full rounded-full bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href={
              typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect")
                ? `/login?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}`
                : "/login"
            }
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
