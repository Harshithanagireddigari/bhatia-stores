"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, ShieldCheck, Truck, HelpCircle, FileCheck } from "lucide-react";

export default function ReturnsAndExchangePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800"
          >
            <ArrowLeft size={16} className="text-[#b49663]" />
            <span>← Go Back</span>
          </button>

          <Link
            href="/"
            className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline"
          >
            Return to Home Page
          </Link>
        </div>

        {/* Header Hero Card */}
        <div className="rounded-[28px] border border-[#e2d5c3] bg-white p-8 sm:p-10 shadow-lg dark:border-[#382f25] dark:bg-[#1a1613] mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b49663] dark:text-[#c5a059]">
            THE BHATIAS POLICIES
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
            Returns & Exchange Policy
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
            Hassle-free 14-day returns, damage guarantees, and replacement process for tiles, sanitaryware, and hardware.
          </p>
        </div>

        {/* Policy Content Sections Grid */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <RefreshCw className="text-[#b49663]" size={22} />
              <span>1. Eligibility for Returns & Exchanges</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-300">
              <li>Items must be returned within <strong>14 business days</strong> of delivery.</li>
              <li>Products must be unused, in original packaging, with all intact security seals and invoices.</li>
              <li>Tiles & slab sets must be returned in full unopened boxes to prevent transit breakage.</li>
              <li>Custom-cut items, special adhesive mixes, and personalized hardware cannot be returned unless damaged upon receipt.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <FileCheck className="text-[#b49663]" size={22} />
              <span>2. Return & Exchange Process</span>
            </h2>
            <ol className="list-decimal pl-5 space-y-3 text-stone-600 dark:text-stone-300">
              <li>
                <strong>Raise Request:</strong> Contact our dedicated WhatsApp support team at{" "}
                <a href="https://wa.me/919120435950" className="text-[#b49663] font-bold hover:underline">
                  +91 9120435950
                </a>{" "}
                or email <code>returns@bhatiastores.com</code> with your order ID.
              </li>
              <li>
                <strong>Quality Inspection:</strong> Upload photo/video proof if reporting transit damage or missing fittings.
              </li>
              <li>
                <strong>Pickup Scheduling:</strong> Our verified logistics partner will inspect and collect the items from your doorstep.
              </li>
              <li>
                <strong>Refund / Replacement Dispatch:</strong> Once verified at our warehouse, replacement items are shipped within 48 hours or refund is initiated.
              </li>
            </ol>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Truck className="text-[#b49663]" size={22} />
              <span>3. Shipping Charges & Refunds</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              For defective or damaged deliveries, Bhatia Stores covers 100% of return freight and reverse pickup charges. For voluntary size or shade exchanges, standard reverse pickup fees will be deducted from store credit. Refunds for online prepaid payments are credited to original payment source within 3-5 bank working days.
            </p>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="text-[#b49663]" size={22} />
              <span>4. Damaged or Fragile Deliveries</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Sanitaryware and ceramic tiles are delicate materials. Please unpack and inspect goods upon delivery in the presence of our courier partner. In case of visible chips or cracks, mark &quot;Damaged on Arrival&quot; on delivery slip and notify us within 24 hours for instant priority replacement.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
