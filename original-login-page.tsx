"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaAnswer }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        loadCaptcha();
        return;
      }

      toast.success("Logged in successfully!");
      if (data.user.role === "admin") {
        router.push("/admin");
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your Bhatia Stores account
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Human verification *
              </label>
              <button type="button" onClick={loadCaptcha} className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                New question
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{captchaQuestion || "Loading question..."}</p>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Register
          </Link>
        </p>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Demo Admin:</strong> admin@bhatia.com / admin123
            <br />
            <strong>Demo Customer:</strong> user@bhatia.com / user123
          </p>
        </div>
      </div>
    </div>
  );
}
