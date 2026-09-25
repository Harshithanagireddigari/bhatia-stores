"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Lock, Eye, EyeOff, Loader2, ArrowLeft, User, ShieldCheck, CheckCircle2 } from "lucide-react";

interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const mockGoogleAccounts: GoogleAccount[] = [
  { name: "Harshitha Nagireddy", email: "harshitha.n@gmail.com", avatar: "H" },
  { name: "Darrajni In", email: "darrajni.in@gmail.com", avatar: "D" },
  { name: "Bhatia Customer", email: "bhatia.customer@gmail.com", avatar: "B" },
];

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function GoogleAuthModal({ isOpen, onClose, redirectUrl }: GoogleAuthModalProps) {
  const router = useRouter();
  
  // Steps: "select_account" -> "password" -> "confirm"
  const [step, setStep] = useState<"select_account" | "password" | "confirm">("select_account");
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount>(mockGoogleAccounts[0]);
  const [customEmail, setCustomEmail] = useState("");
  const [isCustomAccount, setIsCustomAccount] = useState(false);
  const [googlePassword, setGooglePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    setStep("select_account");
    setSelectedAccount(mockGoogleAccounts[0]);
    setCustomEmail("");
    setIsCustomAccount(false);
    setGooglePassword("");
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

  async function handlePasswordNext(e: React.FormEvent) {
    e.preventDefault();
    if (!googlePassword) {
      setErrorMsg("Please enter your password.");
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);

    const emailToUse = isCustomAccount ? customEmail.trim().toLowerCase() : selectedAccount.email;
    const nameToUse = isCustomAccount
      ? customEmail.split("@")[0].charAt(0).toUpperCase() + customEmail.split("@")[0].slice(1)
      : selectedAccount.name;

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

      // Store response user for final redirect
      setErrorMsg(null);
      setStep("confirm");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Password verification failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalConfirm() {
    setLoading(true);
    setErrorMsg(null);

    const emailToUse = isCustomAccount ? customEmail.trim().toLowerCase() : selectedAccount.email;
    const nameToUse = isCustomAccount
      ? customEmail.split("@")[0].charAt(0).toUpperCase() + customEmail.split("@")[0].slice(1)
      : selectedAccount.name;

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

        {/* STEP 1: SELECT ACCOUNT WITHOUT TYPING EMAIL */}
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

              {/* Use another account option */}
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

        {/* STEP 2: ENTER PASSWORD */}
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
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Enter Password *
                </label>
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
                className="w-full rounded-2xl bg-[#c5a059] py-3.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition text-xs"
              >
                Verify & Next
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: CONTINUE AS [NAME] CONFIRMATION */}
        {step === "confirm" && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Identity Verified
            </h2>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              Ready to log in as <strong className="text-stone-900 dark:text-white">{isCustomAccount ? customEmail : selectedAccount.name}</strong>.
            </p>

            {errorMsg && <p className="mt-3 text-xs font-bold text-red-600">{errorMsg}</p>}

            <div className="mt-6 space-y-3">
              {/* GOLD CONTINUE AS BUTTON */}
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
                  <span>Continue as {isCustomAccount ? customEmail.split("@")[0] : selectedAccount.name}</span>
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
