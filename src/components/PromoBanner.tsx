"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface PromoBannerProps {
  title: string;
  subtitle?: string | null;
  code?: string | null;
  discountPercent?: number | null;
  link?: string;
}

export default function PromoBanner({
  title,
  subtitle,
  code,
  discountPercent,
  link = "/shop",
}: PromoBannerProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Coupon code "${code}" copied to clipboard!`);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="border-b border-amber-900/20 bg-gradient-to-r from-purple-950 via-stone-900 to-purple-950 px-4 py-4 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Tag size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">{title}</h3>
              {discountPercent && discountPercent > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-stone-950">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-stone-300 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {code && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-mono font-bold text-amber-300">
              <span>CODE: {code}</span>
              <button
                type="button"
                onClick={copyCode}
                className="ml-1 rounded p-1 hover:bg-amber-400/20 transition-colors"
                title="Copy code"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          <Link
            href={link}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-stone-950 shadow-xs hover:bg-amber-100 transition-colors"
          >
            <span>Shop Offer</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
