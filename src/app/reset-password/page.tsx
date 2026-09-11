"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const params = useSearchParams(); const token = params.get("token") || "";
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle"); const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setState("loading"); try { const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password, confirmPassword }) }); const data = await res.json(); setMessage(data.message || data.error || "Please try again."); setState(res.ok ? "success" : "error"); } catch { setState("error"); setMessage("Could not reach the server. Please try again."); } }
  if (!token) return <main className="min-h-[calc(100vh-73px)] bg-[#f8f6f1] px-4 py-16"><section className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center"><h1 className="font-serif text-3xl">Invalid reset link</h1><Link className="mt-6 inline-block text-[#4a3373]" href="/forgot-password">Request a new link</Link></section></main>;
  return <main className="min-h-[calc(100vh-73px)] bg-[#f8f6f1] px-4 py-16"><section className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-300/30"><p className="eyebrow">Account recovery</p><h1 className="mt-3 font-serif text-4xl">Choose a new password</h1>{state === "success" ? <div className="mt-7 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}<Link href="/login" className="mt-3 block font-semibold underline">Sign in now</Link></div> : <form className="mt-7 space-y-5" onSubmit={submit}><label className="block text-sm font-semibold">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" /></label><label className="block text-sm font-semibold">Confirm new password<input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" /></label>{state === "error" && <p className="text-sm text-red-700">{message}</p>}<button disabled={state === "loading"} className="w-full bg-[#4a3373] py-3 text-sm font-semibold text-white disabled:opacity-60">{state === "loading" ? "Resetting…" : "Reset password"}</button></form>}</section></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-[calc(100vh-73px)] bg-[#f8f6f1] px-4 py-16"><p className="text-center text-sm text-stone-500">Loading password reset…</p></main>}><ResetPasswordForm /></Suspense>;
}
