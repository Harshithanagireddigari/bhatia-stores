"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Scale, ShoppingCart, ShieldCheck, AlertCircle } from "lucide-react";

export default function TermsAndConditionsPage() {
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
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
            Governing rules for catalog browsing, product purchases, payments, and website usage at Bhatia Stores.
          </p>
        </div>

        {/* Policy Content Sections Grid */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Scale className="text-[#b49663]" size={22} />
              <span>1. Terms of Service Acceptance</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              By accessing or purchasing from <strong>Bhatia Stores (The Bhatias Premium Hardware Store)</strong>, you agree to comply with these terms, our Privacy Policy, and Return & Exchange terms. You must be at least 18 years of age or accessing under parental supervision.
            </p>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <ShoppingCart className="text-[#b49663]" size={22} />
              <span>2. Product Pricing & Catalog Accuracy</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300 mb-3">
              We strive to display exact dimensions, finishes, and colors of our sanitaryware and tile collections:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-300">
              <li>Prices are listed in Indian Rupees (₹ INR) inclusive of applicable GST taxes.</li>
              <li>Natural stone and ceramic batch shades may vary slightly from screen mockups due to natural firing processes.</li>
              <li>In the event of a typographical pricing error, Bhatia Stores reserves the right to cancel unconfirmed orders and issue full refunds.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="text-[#b49663]" size={22} />
              <span>3. User Conduct & Security Protections</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Users are prohibited from attempting SQL injection, script tampering, unauthorized API scraping, or bypassing rate-limiters. Automated rate-limiting algorithms active on all endpoints will instantly block malicious traffic attempting to bring down website availability.
            </p>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <AlertCircle className="text-[#b49663]" size={22} />
              <span>4. Contact Information</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              For legal inquiries, terms clarifications, or customer disputes, reach us at:
              <br />
              <strong>Address:</strong> Bhatia Stores, Main Hardware Market, New Delhi, India.
              <br />
              <strong>Support Phone / WhatsApp:</strong> +91 9120435950
              <br />
              <strong>Support Email:</strong> support@bhatiastores.com
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
