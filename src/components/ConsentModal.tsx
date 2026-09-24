"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Check } from "lucide-react";

export default function ConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [returnAgreed, setReturnAgreed] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("bhatia_policy_consent");
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("bhatia_policy_consent", JSON.stringify({
      acceptedAt: new Date().toISOString(),
      termsAgreed,
      privacyAgreed,
      returnAgreed,
    }));
    setIsOpen(false);
  };

  const handleDecline = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans animate-fade-in">
      <div className="w-full max-w-md rounded-[28px] border border-[#e2d5c3] bg-white p-7 shadow-2xl dark:border-[#382f25] dark:bg-[#1a1613] text-stone-900 dark:text-white relative">
        
        {/* BRAND LOGO HEADER */}
        <div className="text-center mb-5">
          <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-full border border-[#c5a059]/40 shadow-md mb-2">
            <Image
              src="/logo.png"
              alt="Bhatia Stores Logo"
              fill
              className="object-cover"
            />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
            Welcome to The Bhatias
          </h2>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
            To continue browsing our luxury catalog, please review and accept our store policies.
          </p>
        </div>

        {/* POLICY CONSENT CHECKBOXES (Matching Design Mockup) */}
        <div className="space-y-3.5 my-6 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 dark:bg-stone-900/60">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#b49663] rounded"
            />
            <span className="text-stone-700 dark:text-stone-300">
              I agree to the{" "}
              <Link href="/terms-and-conditions" target="_blank" className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
                Terms & Conditions *
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#b49663] rounded"
            />
            <span className="text-stone-700 dark:text-stone-300">
              I have read and understood the{" "}
              <Link href="/privacy-policy" target="_blank" className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
                Privacy Policy *
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={returnAgreed}
              onChange={(e) => setReturnAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#b49663] rounded"
            />
            <span className="text-stone-700 dark:text-stone-300">
              I agree to the{" "}
              <Link href="/returns-and-exchange" target="_blank" className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
                Return, Exchange & Refund Policy *
              </Link>
            </span>
          </label>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccept}
            disabled={!termsAgreed || !privacyAgreed || !returnAgreed}
            className="flex-1 rounded-2xl bg-[#c5a059] py-3.5 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} />
            <span>Accept & Continue</span>
          </button>
          <button
            onClick={handleDecline}
            className="rounded-2xl border border-stone-300 bg-white px-5 py-3.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 transition"
          >
            Decline
          </button>
        </div>

      </div>
    </div>
  );
}
