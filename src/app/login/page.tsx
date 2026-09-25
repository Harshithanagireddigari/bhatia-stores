"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { brandImageUrls, hasHostedImage } from "@/config/image-urls";
import GoogleAuthModal from "@/components/GoogleAuthModal";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const [authMedia, setAuthMedia] = useState({
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-bathroom-interior-with-a-tub-41551-large.mp4",
    mediaType: "video",
    eyebrow: "BHATIA STORES",
    heading: "Beautiful spaces begin with the",
    accent: "right surface.",
    description: "Discover premium tiles and sanitaryware for spaces that deserve a distinctive finish.",
  });

  useEffect(() => {
    async function fetchAuthMedia() {
      try {
        const res = await fetch("/api/admin/settings?key=auth_media");
        if (res.ok) {
          const data = await res.json();
          const stored = data.auth_media || data.value;
          if (stored && stored.mediaUrl) {
            const cleanUrl = stored.mediaUrl.toLowerCase();
            const isVid =
              stored.mediaType === "video" ||
              cleanUrl.endsWith(".mp4") ||
              cleanUrl.endsWith(".webm") ||
              cleanUrl.endsWith(".mov") ||
              cleanUrl.includes("video/upload") ||
              cleanUrl.includes("mixkit");

            setAuthMedia({
              mediaUrl: stored.mediaUrl,
              mediaType: isVid ? "video" : "image",
              eyebrow: stored.eyebrow || "BHATIA STORES",
              heading: stored.heading || "Beautiful spaces begin with the",
              accent: stored.accent || "right surface.",
              description: stored.description || "Discover premium tiles and sanitaryware for spaces that deserve a distinctive finish.",
            });
          }
        }
      } catch {
        // fallback
      }
    }
    void fetchAuthMedia();
  }, []);

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

      const redirectUrl = new URLSearchParams(window.location.search).get("redirect");

      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (redirectUrl) {
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

  const redirectUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") || undefined : undefined;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f7f6f2] dark:bg-[#12100e] px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-2">

        {/* LEFT: BRAND PANEL WITH DYNAMIC VIDEO OR PHOTO */}
        <section className="relative hidden min-h-[680px] overflow-hidden lg:block bg-stone-900">
          {authMedia.mediaType === "video" ? (
            <video
              key={authMedia.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover scale-105"
            >
              <source src={authMedia.mediaUrl} />
            </video>
          ) : (
            <img
              src={authMedia.mediaUrl}
              alt="Bhatia Stores background"
              className="absolute inset-0 h-full w-full object-cover scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7b45a]">
                {authMedia.eyebrow}
              </p>

              <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.08]">
                {authMedia.heading}
                <span className="block text-[#d7b45a]">
                  {authMedia.accent}
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
                {authMedia.description}
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
        <section className="flex items-center p-7 sm:p-10 lg:p-12 dark:bg-stone-900">
          <div className="mx-auto w-full max-w-md">

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b49663] dark:text-[#c5a059]">
                Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Sign in to Bhatia Stores
              </h1>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Access your orders, wishlist and account details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 dark:text-stone-300">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b49663] focus:ring-4 focus:ring-[#b49663]/10 dark:border-stone-800 dark:bg-stone-950 dark:text-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-800">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b49663] focus:ring-4 focus:ring-[#b49663]/10"
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold text-gray-800">
                    Human verification
                  </label>

                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="text-xs font-semibold text-[#b49663] transition hover:underline"
                  >
                    New question
                  </button>
                </div>

                <div className="mt-1.5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <p className="text-xs font-medium text-gray-700">
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
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b49663] focus:ring-4 focus:ring-[#b49663]/10"
                />
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#b49663] transition hover:underline"
                >
                  Forgot password? Log in with OTP &rarr;
                </Link>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={loading || !captchaQuestion}
                className="w-full rounded-2xl bg-[#b49663] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b49663]/20 transition hover:bg-[#967b4b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* OR Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Continue with Google button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Register link */}
            <p className="mt-6 text-center text-xs text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                className="font-bold text-[#b49663] transition hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* Google Auth Account Chooser Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        redirectUrl={redirectUrl}
      />
    </main>
  );
}
