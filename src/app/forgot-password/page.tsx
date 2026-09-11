"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    try { const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const data = await res.json(); setMessage(data.message || data.error || "Please try again."); setState(res.ok ? "sent" : "error"); } catch { setMessage("Could not reach the server. Please try again."); setState("error"); }
  }
  return <main className="min-h-[calc(100vh-73px)] bg-[#f8f6f1] px-4 py-16"><section className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-300/30"><p className="eyebrow">Account recovery</p><h1 className="mt-3 font-serif text-4xl">Reset your password</h1><p className="mt-3 text-sm leading-6 text-stone-600">Enter your account email and we’ll send a secure one-time reset link.</p>{state === "sent" ? <div className="mt-7 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}<Link href="/login" className="mt-3 block font-semibold underline">Return to sign in</Link></div> : <form className="mt-7 space-y-5" onSubmit={submit}><label className="block text-sm font-semibold">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" placeholder="you@example.com" /></label>{state === "error" && <p className="text-sm text-red-700">{message}</p>}<button disabled={state === "loading"} className="w-full bg-[#4a3373] py-3 text-sm font-semibold text-white disabled:opacity-60">{state === "loading" ? "Sending…" : "Send reset link"}</button></form>}<Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#4a3373]">← Back to sign in</Link></section></main>;
}
