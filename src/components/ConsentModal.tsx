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
    localStorage.setItem("bhatia_policy_consent", JSON.stringify({
      acceptedAt: new Date().toISOString(),
      declined: true,
    }));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      role="region"
      aria-label="Store Policies & Privacy Consent"
      className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-40 font-sans animate-slide-up"
    >
      <div className="w-full rounded-2xl border border-[#e2d5c3] bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-[#382f25] dark:bg-[#1a1613]/95 text-stone-900 dark:text-white">
        
        {/* BRAND LOGO HEADER */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#c5a059]/40 shadow-sm">
            <Image
              src="/logo.png"
              alt="Bhatia Stores Logo"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-900 dark:text-white leading-tight">
              Store Policies &amp; Consent
            </h2>
            <p className="text-[11px] text-stone-600 dark:text-stone-300">
              Please review and accept our store policies for a seamless shopping experience.
            </p>
          </div>
        </div>

        {/* POLICY CONSENT CHECKBOXES */}
        <div className="space-y-2 my-3 text-[11px] bg-stone-50/80 p-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-900/60">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[#b49663] rounded"
            />
            <span className="text-stone-700 dark:text-stone-300">
              I agree to the{" "}
              <Link href="/terms-and-conditions" target="_blank" className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
                Terms &amp; Conditions *
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[#b49663] rounded"
            />
            <span className="text-stone-700 dark:text-stone-300">
              I have read the{" "}
              <Link href="/privacy-policy" target="_blank" className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
                Privacy Policy *
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={returnAgreed}
              onChange={(e) => setReturnAgreed(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[#b49663] rounded"
            />
            <span className="text-stone-700 dark:text-stone-300">
              I agree to the{" "}
              <Link href="/returns-and-exchange" target="_blank" className="font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
                Return &amp; Refund Policy *
              </Link>
            </span>
          </label>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={handleAccept}
            disabled={!termsAgreed || !privacyAgreed || !returnAgreed}
            className="flex-1 rounded-xl bg-[#c5a059] py-2.5 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={15} />
            <span>Accept &amp; Continue</span>
          </button>
          <button
            onClick={handleDecline}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 transition"
          >
            Dismiss
          </button>
        </div>

      </div>
    </aside>
  );
}
