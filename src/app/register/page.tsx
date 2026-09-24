"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
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
    <div className="min-h-[85vh] bg-[#f8f6f1] dark:bg-[#12100e] flex items-center justify-center px-4 py-10 transition-colors font-sans">
      <div className="w-full max-w-md rounded-[28px] border border-[#e2d5c3] bg-white p-8 shadow-xl dark:border-[#382f25] dark:bg-[#1a1613]">
        
        {/* BRAND LUXURY HEADER */}
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#b49663] dark:text-[#c5a059]">
            THE BHATIAS HARDWARE STORE
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900 dark:text-white">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
            Join Bhatia Stores for instant orders & saved wishlist
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              pattern="^(\+91[\s-]?)?[6-9]\d{9}$"
              placeholder="+91 9876543210"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
            />
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              10-digit Indian phone number (+91 optional)
            </p>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="block font-bold text-stone-700 dark:text-stone-300">
                Human Verification *
              </label>
              <button
                type="button"
                onClick={loadCaptcha}
                className="flex items-center gap-1 text-[11px] font-bold text-[#b49663] dark:text-[#c5a059] hover:underline"
              >
                <RefreshCw size={12} />
                <span>New question</span>
              </button>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mb-1 font-medium">
              {captchaQuestion || "Loading math challenge..."}
            </p>
            <input
              type="number"
              inputMode="numeric"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
              placeholder="Your answer"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-stone-900 outline-none transition focus:border-[#b49663] dark:border-[#3c3328] dark:bg-[#25201b] dark:text-white dark:focus:border-[#c5a059]"
            />
          </div>

          {/* LUXURY GOLD SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || !captchaQuestion}
            className="w-full rounded-2xl bg-[#c5a059] hover:bg-[#b49663] py-4 font-bold text-stone-900 dark:text-stone-900 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-600 dark:text-stone-400">
          Already have an account?{" "}
          <Link
            href={
              typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect")
                ? `/login?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}`
                : "/login"
            }
            className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
