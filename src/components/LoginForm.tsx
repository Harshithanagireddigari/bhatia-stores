"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

export default function LoginForm() {
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
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-sans">
      <div>
        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
          placeholder="••••••••"
        />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <label className="block font-bold text-stone-700 dark:text-stone-300">Human Verification *</label>
          <button type="button" onClick={loadCaptcha} className="flex items-center gap-1 text-[11px] font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
            <RefreshCw size={12} />
            <span>New question</span>
          </button>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-300 mb-1 font-medium">{captchaQuestion || "Loading challenge..."}</p>
        <input
          type="number"
          inputMode="numeric"
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value)}
          required
          className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
          placeholder="Your answer"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !captchaQuestion}
        className="w-full rounded-2xl bg-[#c5a059] hover:bg-[#b49663] py-4 font-bold text-stone-900 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </button>
    </form>
  );
}
