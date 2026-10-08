"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  isFirstOrderOnly: number;
  minOrderAmount: string | null;
  expiryDate: string | null;
  isActive: number;
};

export default function OffersBannerSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coupons")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCoupons(data);
        }
      })
      .catch(() => {});
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  if (coupons.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 font-sans">
      {/* EXCLUSIVE OFFERS HERO CARD */}
      <div className="relative overflow-hidden rounded-xl border border-[#c5a059]/30 bg-gradient-to-r from-[#2a221b] via-[#403328] to-[#1e1712] p-5 text-white shadow-xl sm:rounded-3xl sm:p-10">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/50 bg-[#c5a059]/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#e2c792] sm:px-3.5 sm:text-[10px] sm:tracking-[0.2em]">
            <Sparkles size={13} />
            EXCLUSIVE OFFERS & FESTIVE DEALS
          </span>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-white sm:mt-4 sm:text-4xl">
            Upto <span className="text-[#e2c792]">40% OFF</span> on Premium Bathroom Suites
          </h2>
          <p className="mt-2 text-xs leading-5 text-stone-300 sm:leading-normal">
            Apply verified discount coupons at checkout for extra instant savings on tiles, faucets, and sanitaryware.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#b49663] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#967b4b] sm:mt-6 sm:rounded-2xl sm:px-6 sm:py-3"
          >
            <span>Shop Now</span>
          </Link>
        </div>

        {/* Decorative Background Image Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-cover bg-center pointer-events-none hidden md:block" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800')" }} />
      </div>

      {/* ACTIVE COUPONS CARDS ROW (Matches Image 3) */}
      <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((cpn, idx) => {
          const colorStyles = [
            "border-red-200 bg-red-50/70 dark:border-red-950 dark:bg-red-950/30 text-red-900 dark:text-red-200",
            "border-amber-200 bg-amber-50/70 dark:border-amber-950 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200",
            "border-rose-200 bg-rose-50/70 dark:border-rose-950 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200",
          ][idx % 3];

          const badgeColor = [
            "bg-red-600 text-white",
            "bg-amber-600 text-white",
            "bg-rose-600 text-white",
          ][idx % 3];

          return (
            <div
              key={cpn.id}
              className={`relative rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 ${colorStyles}`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[11px] font-mono font-bold tracking-wider ${badgeColor}`}>
                  {cpn.code}
                </span>
                <button
                  onClick={() => copyCode(cpn.code)}
                  className="flex items-center gap-1 text-[11px] font-bold hover:underline"
                >
                  {copiedCode === cpn.code ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-serif text-xl font-bold">
                  {cpn.discountType === "percentage"
                    ? `${cpn.discountValue}% OFF`
                    : `₹${Number(cpn.discountValue).toLocaleString("en-IN")} OFF`}
                </h3>
                <p className="mt-1 text-xs opacity-80">
                  {cpn.isFirstOrderOnly === 1 ? "Valid on your first order" : "Valid on all qualifying orders"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-black/10 pt-3 text-[11px] opacity-75 dark:border-white/10">
                <span>
                  {Number(cpn.minOrderAmount || 0) > 0
                    ? `Min. order: ₹${Number(cpn.minOrderAmount).toLocaleString("en-IN")}`
                    : "No minimum order"}
                </span>
                {cpn.expiryDate && (
                  <span>
                    Valid till{" "}
                    {new Date(cpn.expiryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
