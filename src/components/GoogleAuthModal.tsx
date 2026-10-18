"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Lock, Eye, EyeOff, Loader2, ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function GoogleAuthModal({ isOpen, onClose, redirectUrl }: GoogleAuthModalProps) {
  const router = useRouter();
  
  // Steps: "login" (enter email & password) | "otp" (verify 6-digit code)
  const [step, setStep] = useState<"login" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    setStep("login");
    setEmail("");
    setPassword("");
    setOtpCode("");
    setShowPassword(false);
    setErrorMsg(null);
    onClose();
  }

  async function handleGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg("Please enter both your Google email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const nameToUse = cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          name: nameToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed. Please check your credentials.");
      }

      toast.success(`Welcome to Bhatia Stores, ${data.user.name}!`);
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
      const msg = err instanceof Error ? err.message : "Google authentication failed.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Please enter your Google email above to receive an OTP code.");
      return;
    }

    setSendingOtp(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP email.");
      }

      toast.success(`6-digit OTP code sent to ${cleanEmail}! Please check your inbox.`);
      setStep("otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP email.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP code.");
      }

      toast.success(`OTP verified successfully! Welcome ${data.user.name}`);
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
      const msg = err instanceof Error ? err.message : "OTP verification failed.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm font-sans animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-[#1a1613] text-stone-900 dark:text-white relative">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-white transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* STEP 1: DIRECT GOOGLE EMAIL & PASSWORD ENTERING */}
        {step === "login" && (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-[#b49663] dark:bg-amber-950/40 mb-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Sign in with Google
              </h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                to continue to Bhatia Stores
              </p>
            </div>

            <form onSubmit={handleGoogleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Google Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Google email (e.g. name@gmail.com)"
                    className="w-full rounded-2xl border border-stone-300 bg-white p-3.5 pl-10 text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">
                    Google Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="text-[11px] font-bold text-[#b49663] hover:underline dark:text-[#c5a059] flex items-center gap-1 disabled:opacity-50"
                  >
                    {sendingOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound size={12} />}
                    <span>Forgot password? Log in with OTP</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Google account password"
                    className="w-full rounded-2xl border border-stone-300 bg-white p-3.5 pl-10 pr-10 text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#c5a059] py-3.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Sign In with Google</span>
              </button>

              <p className="text-[11px] text-center text-stone-500 dark:text-stone-400 pt-1">
                Secure 256-bit SSL encrypted Google authorization
              </p>
            </form>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION SCREEN */}
        {step === "otp" && (
          <div>
            <button
              onClick={() => setStep("login")}
              className="flex items-center gap-1.5 text-xs font-bold text-[#b49663] dark:text-[#c5a059] mb-4 hover:underline"
            >
              <ArrowLeft size={16} />
              <span>Back to password</span>
            </button>

            <div className="text-center mb-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-[#b49663] dark:bg-amber-950/40 mb-2">
                <Mail size={24} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Enter Email OTP
              </h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                We've sent a 6-digit one-time code to <strong className="text-stone-900 dark:text-white">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 749201"
                  className="w-full text-center font-mono tracking-[0.5em] text-lg font-bold rounded-2xl border border-stone-300 bg-white p-3.5 text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#c5a059] py-3.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Verify OTP &amp; Log In</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="text-xs font-bold text-[#b49663] hover:underline dark:text-[#c5a059]"
                >
                  {sendingOtp ? "Resending..." : "Didn't receive code? Resend OTP"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
