"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, UserCircle } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function GoogleAuthModal({ isOpen, onClose, redirectUrl }: GoogleAuthModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "password">("email");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    setStep("email");
    setGoogleEmail("");
    setGooglePassword("");
    setShowPassword(false);
    setErrorMsg(null);
    onClose();
  }

  function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid Google email address.");
      return;
    }

    setErrorMsg(null);
    setStep("password");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanPassword = googlePassword.trim();

    if (!cleanPassword) {
      setErrorMsg("Please enter your Google account password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const emailUser = cleanEmail.split("@")[0];
      const derivedName = emailUser
        .split(/[^a-zA-Z0-9]/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ") || "Google User";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          name: derivedName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google sign-in failed.");
      }

      toast.success(`Signed in successfully as ${cleanEmail}`);
      handleClose();

      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/shop");
      }
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google Sign-In failed.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900 font-sans">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 transition"
        >
          <X size={18} />
        </button>

        {/* Google Header */}
        <div className="text-center pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-800">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
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
          </div>
          <h2 className="mt-4 font-serif text-xl font-bold text-stone-900 dark:text-white">
            {step === "email" ? "Sign in with Google" : "Welcome"}
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {step === "email"
              ? "Use your Google Account to sign in to The Bhatias"
              : "To continue, first verify that it's you"}
          </p>
        </div>

        {/* Account Badge for Password Step */}
        {step === "password" && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-2.5 dark:border-stone-800 dark:bg-stone-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserCircle className="text-stone-500 shrink-0" size={20} />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                {googleEmail}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setErrorMsg(null);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#b49663] hover:underline"
            >
              <ArrowLeft size={12} />
              <span>Change</span>
            </button>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === "email" && (
          <form onSubmit={handleEmailNext} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1.5">
                Google Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => {
                    setGoogleEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="name@gmail.com"
                  required
                  autoFocus
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50/50 pl-10 pr-4 py-3 text-sm text-stone-900 outline-none focus:border-[#b49663] focus:bg-white focus:ring-1 focus:ring-[#b49663] dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-[#b49663]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!googleEmail.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b49663] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#967b4b] disabled:opacity-50"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Password Form */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1.5">
                Google Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={googlePassword}
                  onChange={(e) => {
                    setGooglePassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50/50 pl-10 pr-10 py-3 text-sm text-stone-900 outline-none focus:border-[#b49663] focus:bg-white focus:ring-1 focus:ring-[#b49663] dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-[#b49663]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !googlePassword.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b49663] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#967b4b] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Verifying Google Account...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[11px] text-stone-400 dark:text-stone-500">
          By continuing, you agree to The Bhatias Privacy Policy and Terms of Service.
        </p>
      </div>
    </div>
  );
}
