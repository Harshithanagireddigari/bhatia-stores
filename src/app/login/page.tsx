"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      const res = await fetch("/api/auth/captcha", {
        cache: "no-store",
      });

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          captchaAnswer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        await loadCaptcha();
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
    <main className="min-h-[calc(100vh-73px)] bg-[#f7f6f2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">

        {/* LEFT: BRAND PANEL */}
        <section className="relative hidden min-h-[680px] overflow-hidden lg:block">
          <Image
            src="/products/catalog/bhatia-catalogue-02.jpg"
            alt="Bhatia Stores tile collection"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7b45a]">
                BHATIA STORES
              </p>

              <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.08]">
                Beautiful spaces
                <br />
                begin with the
                <span className="block text-[#d7b45a]">
                  right surface.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
                Discover premium tiles and sanitaryware for spaces that
                deserve a distinctive finish.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-px w-16 bg-[#d7b45a]" />

              <p className="max-w-sm text-sm leading-6 text-white/65">
                Premium collections, secure checkout and dedicated WhatsApp
                support.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: LOGIN */}
        <section className="flex items-center p-7 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                Welcome back
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                Sign in to Bhatia Stores
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Access your orders, wishlist and account details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Human verification
                  </label>

                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    New question
                  </button>
                </div>

                <div className="mt-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-gray-700">
                    {captchaQuestion || "Loading question..."}
                  </p>
                </div>

                <input
                  type="number"
                  inputMode="numeric"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                  placeholder="Enter your answer"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-gray-500 transition hover:text-indigo-600"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading || !captchaQuestion}
                className="w-full rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Register */}
            <p className="mt-7 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Create an account
              </Link>
            </p>

            {/* Security note */}
            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs leading-5 text-gray-400">
                Your account information is protected with secure
                authentication.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}