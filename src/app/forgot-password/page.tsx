"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step flow: 2 = Enter Email, 3 = OTP Sent, 4 = Enter OTP, 5 = Logged In
  const [step, setStep] = useState<2 | 3 | 4 | 5>(2);

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Resend Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((step === 3 || step === 4) && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Step 2: Request OTP
  async function handleSendOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your registered email");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      toast.success("OTP code sent to your email!");
      setStep(3);
      setResendTimer(45);
      setCanResend(false);

      // Transition to Enter OTP step after 1.5 seconds or immediately
      setTimeout(() => {
        setStep(4);
        setTimeout(() => inputRefs[0].current?.focus(), 100);
      }, 1200);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  }

  // Handle individual digit input for 6-box OTP
  function handleDigitChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste of full 6-digit code
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || "";
        }
        setOtpDigits(newDigits);
        inputRefs[Math.min(pasted.length, 5)].current?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  // Step 4: Verify OTP & Login
  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) return toast.error("Please enter the full 6-digit OTP code");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code");

      toast.success("OTP verified successfully!");
      setStep(5);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP handler
  async function handleResend() {
    if (!canResend) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");

      toast.success("A new 6-digit OTP has been sent!");
      setResendTimer(45);
      setCanResend(false);
      setOtpDigits(Array(6).fill(""));
      setStep(3);
      setTimeout(() => {
        setStep(4);
        setTimeout(() => inputRefs[0].current?.focus(), 100);
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#fbf9f5] px-4 py-12 dark:bg-stone-950 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 shadow-xl dark:border-stone-800 dark:bg-stone-900 text-center">
        
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <p className="font-serif text-xl font-bold tracking-[.15em] text-[#4a3373] dark:text-[#e2bd72]">THE BHATIAS</p>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a08b68]">HARDWARE STORE</p>
        </div>

        {/* STEP 2: FORGOT PASSWORD */}
        {step === 2 && (
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Forgot Password?</h1>
            <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
              Enter your registered email address. We&apos;ll send you a one-time code to login.
            </p>

            <form onSubmit={handleSendOtp} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">Email Address</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="harshitha@example.com"
                    className="w-full rounded-2xl border border-stone-300 bg-white py-3.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-[#b49663] focus:ring-4 focus:ring-[#b49663]/10 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#b49663] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b49663]/20 transition hover:bg-[#967b4b] disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-6 inline-block text-xs font-semibold text-[#b49663] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* STEP 3: OTP SENT CONFIRMATION */}
        {step === 3 && (
          <div className="py-4 animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">OTP Sent!</h1>
            <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
              We&apos;ve sent a 6-digit code to <strong className="text-stone-900 dark:text-white">{email}</strong>. Please check your inbox.
            </p>

            <div className="my-6 flex justify-center text-stone-400">
              <Mail size={48} className="animate-bounce text-[#b49663]" />
            </div>

            <p className="text-xs text-stone-400">
              Didn&apos;t receive the code?{" "}
              {canResend ? (
                <button onClick={handleResend} className="font-bold text-[#b49663] hover:underline">
                  Resend OTP Now
                </button>
              ) : (
                <span className="font-semibold text-stone-500">
                  Resend OTP ({String(Math.floor(resendTimer / 60)).padStart(2, "0")}:{String(resendTimer % 60).padStart(2, "0")})
                </span>
              )}
            </p>

            <Link href="/login" className="mt-6 inline-block text-xs font-semibold text-[#b49663] hover:underline">
              Back to Login
            </Link>
          </div>
        )}

        {/* STEP 4: ENTER 6-DIGIT OTP */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Enter OTP</h1>
            <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
              We&apos;ve sent a 6-digit code to <strong className="text-stone-900 dark:text-white">{email}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
              {/* 6 Individual Digit Inputs */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-12 w-11 sm:h-13 sm:w-12 rounded-xl border border-stone-300 bg-white text-center font-mono text-xl font-bold text-stone-900 outline-none transition focus:border-[#b49663] focus:ring-4 focus:ring-[#b49663]/15 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join("").length !== 6}
                className="w-full rounded-2xl bg-[#b49663] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b49663]/20 transition hover:bg-[#967b4b] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>

            <div className="mt-6 text-xs text-stone-400">
              Didn&apos;t receive the code?{" "}
              {canResend ? (
                <button onClick={handleResend} className="font-bold text-[#b49663] hover:underline">
                  Resend OTP Now
                </button>
              ) : (
                <span className="font-semibold text-stone-500">
                  Resend OTP ({String(Math.floor(resendTimer / 60)).padStart(2, "0")}:{String(resendTimer % 60).padStart(2, "0")})
                </span>
              )}
            </div>

            <Link href="/login" className="mt-4 inline-block text-xs font-semibold text-[#b49663] hover:underline">
              Back to Login
            </Link>
          </div>
        )}

        {/* STEP 5: LOGGED IN SUCCESSFULLY */}
        {step === 5 && (
          <div className="py-4 animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">Welcome to The Bhatias!</h1>
            <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
              You have been logged in successfully using OTP.
            </p>

            <button
              onClick={() => {
                router.push("/shop");
                router.refresh();
              }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b49663] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b49663]/20 transition hover:bg-[#967b4b]"
            >
              Continue to Shop <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
