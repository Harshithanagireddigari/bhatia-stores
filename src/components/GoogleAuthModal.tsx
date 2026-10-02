"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Lock, Eye, EyeOff, Loader2, ArrowLeft, User, ShieldCheck, CheckCircle2, KeyRound, Mail } from "lucide-react";

interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const mockGoogleAccounts: GoogleAccount[] = [
  { name: "Harshitha N", email: "harshitha@gmail.com", avatar: "H" },
  { name: "Harshitha N", email: "harshitha@sharda.ac.in", avatar: "H" },
];

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function GoogleAuthModal({ isOpen, onClose, redirectUrl }: GoogleAuthModalProps) {
  const router = useRouter();
  
  // Steps: "select_account" -> "password" -> "otp" -> "confirm"
  const [step, setStep] = useState<"select_account" | "password" | "otp" | "confirm">("select_account");
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount>(mockGoogleAccounts[0]);
  const [customEmail, setCustomEmail] = useState("");
  const [isCustomAccount, setIsCustomAccount] = useState(false);
  const [googlePassword, setGooglePassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    setStep("select_account");
    setSelectedAccount(mockGoogleAccounts[0]);
    setCustomEmail("");
    setIsCustomAccount(false);
    setGooglePassword("");
    setOtpCode("");
    setShowPassword(false);
    setErrorMsg(null);
    onClose();
  }

  function handleSelectAccount(acc: GoogleAccount) {
    setSelectedAccount(acc);
    setIsCustomAccount(false);
    setErrorMsg(null);
    setStep("password");
  }

  const getTargetEmail = () => (isCustomAccount ? customEmail.trim().toLowerCase() : selectedAccount.email);
  const getTargetName = () =>
    isCustomAccount
      ? customEmail.split("@")[0].charAt(0).toUpperCase() + customEmail.split("@")[0].slice(1)
      : selectedAccount.name;

  async function handlePasswordNext(e: React.FormEvent) {
    e.preventDefault();
    if (!googlePassword) {
      setErrorMsg("Please enter your password.");
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);

    const emailToUse = getTargetEmail();
    const nameToUse = getTargetName();

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          password: googlePassword,
          name: nameToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect password.");
      }

      setErrorMsg(null);
      setStep("confirm");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Password verification failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    const emailToUse = getTargetEmail();
    if (!emailToUse) {
      setErrorMsg("Please enter a valid Google email address.");
      return;
    }

    setSendingOtp(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP email");
      }

      toast.success(`6-digit OTP sent to ${emailToUse}! Please check your inbox.`);
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
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const emailToUse = getTargetEmail();

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
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

  async function handleFinalConfirm() {
    setLoading(true);
    setErrorMsg(null);

    const emailToUse = getTargetEmail();
    const nameToUse = getTargetName();

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          password: googlePassword,
          name: nameToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google sign-in failed.");
      }

      toast.success(`Signed in as ${nameToUse}`);
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

        {/* STEP 1: SELECT ACCOUNT */}
        {step === "select_account" && (
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
                Choose an Account
              </h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                to continue to Bhatia Stores
              </p>
            </div>

            <div className="space-y-3">
              {mockGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3.5 text-left shadow-sm transition hover:border-[#b49663] hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-[#c5a059]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4a3373] text-sm font-bold text-white shadow-sm">
                    {acc.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-stone-900 dark:text-white truncate">{acc.name}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}

              <button
                onClick={() => {
                  setIsCustomAccount(true);
                  setStep("password");
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-3 text-xs font-bold text-stone-600 hover:border-[#b49663] hover:text-[#b49663] dark:border-stone-700 dark:text-stone-400"
              >
                <User size={18} />
                <span>Use another account</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER PASSWORD WITH FORGOT PASSWORD OPTION */}
        {step === "password" && (
          <div>
            <button
              onClick={() => setStep("select_account")}
              className="flex items-center gap-1.5 text-xs font-bold text-[#b49663] dark:text-[#c5a059] mb-4 hover:underline"
            >
              <ArrowLeft size={16} />
              <span>Back to account list</span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 mb-5 dark:border-stone-800 dark:bg-stone-900">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a3373] text-xs font-bold text-white">
                {isCustomAccount ? "G" : selectedAccount.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-stone-900 dark:text-white truncate">
                  {isCustomAccount ? "Google Account" : selectedAccount.name}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {isCustomAccount ? (customEmail || "Enter email below") : selectedAccount.email}
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordNext} className="space-y-4 text-xs">
              {isCustomAccount && (
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Google Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full rounded-2xl border border-stone-300 bg-white p-3.5 text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">
                    Enter Password *
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
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-2xl border border-stone-300 bg-white p-3.5 pr-10 text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#c5a059] py-3.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Verify & Next</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION SCREEN */}
        {step === "otp" && (
          <div>
            <button
              onClick={() => setStep("password")}
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
                We've sent a 6-digit one-time code to <strong className="text-stone-900 dark:text-white">{getTargetEmail()}</strong>
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

              {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#c5a059] py-3.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Verify OTP & Log In</span>
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

        {/* STEP 4: CONTINUE CONFIRMATION */}
        {step === "confirm" && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Identity Verified
            </h2>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              Ready to log in as <strong className="text-stone-900 dark:text-white">{getTargetEmail()}</strong>.
            </p>

            {errorMsg && <p className="mt-3 text-xs font-bold text-red-600">{errorMsg}</p>}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleFinalConfirm}
                disabled={loading}
                className="w-full rounded-2xl bg-[#c5a059] hover:bg-[#b49663] py-4 font-bold text-stone-900 shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Continue as {getTargetName()}</span>
                )}
              </button>

              <button
                onClick={() => setStep("select_account")}
                className="text-xs font-bold text-stone-500 hover:underline"
              >
                Choose another account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
