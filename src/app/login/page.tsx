"use client";

import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { Lock, UserPlus, HelpCircle } from "lucide-react";

function LoginContent() {
  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-xl dark:border-stone-800 dark:bg-stone-900">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Account Access
          </span>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Customer Sign In
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Access your orders, saved delivery addresses, and wishlist.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5 text-xs dark:border-stone-800">
          <Link
            href="/forgot-password"
            className="flex items-center gap-1 font-semibold text-purple-900 hover:underline dark:text-amber-400"
          >
            <HelpCircle size={13} />
            <span>Forgot password?</span>
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-1 font-semibold text-stone-700 hover:text-purple-900 dark:text-stone-300 dark:hover:text-amber-400"
          >
            <UserPlus size={13} />
            <span>Create account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
