"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPortal() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, bypassCaptcha: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid admin credentials.");
      }

      if (data.user?.role !== "admin") {
        toast.error("Access denied. This account does not have administrative privileges.");
        setLoading(false);
        return;
      }

      toast.success("Admin authenticated successfully!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Admin authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0b09] px-4 py-12 font-sans text-stone-100">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-800 bg-[#161310] p-8 shadow-2xl">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[#b49663]/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-[#b49663]/10 blur-3xl" />

        {/* Admin Header */}
        <div className="relative z-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b49663]/40 bg-[#1f1b16] text-[#b49663] shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b49663]">
            BHATIA STORES CONTROL PORTAL
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-white">
            Admin Authentication
          </h1>
          <p className="mt-1.5 text-xs text-stone-400">
            Please enter your admin email/username and password to access dashboard controls.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="relative z-10 mt-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Admin Username / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bhatiastores.com"
                required
                autoFocus
                className="w-full rounded-2xl border border-stone-800 bg-[#1f1b16] pl-10 pr-4 py-3.5 text-sm text-white placeholder-stone-600 outline-none transition focus:border-[#b49663] focus:ring-1 focus:ring-[#b49663]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-2xl border border-stone-800 bg-[#1f1b16] pl-10 pr-4 py-3.5 text-sm text-white placeholder-stone-600 outline-none transition focus:border-[#b49663] focus:ring-1 focus:ring-[#b49663]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b49663] py-4 text-sm font-bold text-white shadow-lg shadow-[#b49663]/20 transition hover:bg-[#967b4b] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <span>Unlock Admin Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="relative z-10 mt-6 text-center text-[11px] text-stone-500">
          Encrypted Admin Session • Bhatia Stores Management Gateway
        </p>
      </div>
    </div>
  );
}
