"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Eye, Trash2, Database } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
            Last updated: September 2026. How Bhatia Stores protects, uses, and respects customer data and credentials.
          </p>
        </div>

        {/* Policy Content Sections Grid */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Database className="text-[#b49663]" size={22} />
              <span>1. Information We Collect</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300 mb-3">
              We collect personal data required to fulfill orders and provide luxury hardware support:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-300">
              <li><strong>Personal Identity:</strong> Full Name, Email Address, Verified Indian Mobile Number.</li>
              <li><strong>Delivery Addresses:</strong> Street Address, City, State, Pincode, Landmark for courier routing.</li>
              <li><strong>Payment Data:</strong> Transaction tokens processed through PCI-DSS compliant Razorpay gateways (we never store raw card CVV or bank passwords).</li>
              <li><strong>Technical Logs:</strong> IP address, device cookies, browser user-agent for rate-limiting and security protection.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock className="text-[#b49663]" size={22} />
              <span>2. Security & Password Encryption</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Customer passwords are encrypted using bcrypt salted hash standards. All server communications run over SSL 256-bit TLS encryption. Rate limiting algorithms protect customer accounts against brute-force attacks.
            </p>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Eye className="text-[#b49663]" size={22} />
              <span>3. How We Use Your Data</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-300">
              <li>Processing tile orders, generating tax invoices, and scheduling home delivery.</li>
              <li>Sending live WhatsApp and email dispatch updates with tracking links.</li>
              <li>Verifying human CAPTCHA & OTP sign-ins to eliminate spam.</li>
              <li>We <strong>never sell or rent</strong> customer email addresses or phone numbers to third-party advertisers.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Trash2 className="text-[#b49663]" size={22} />
              <span>4. Permanent Account Deletion Rights</span>
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              You retain total control over your digital identity. Customers can request or execute 1-click permanent account deletion under <Link href="/account#settings" className="text-[#b49663] font-bold hover:underline">My Account → Settings</Link>. Deleting your account purges all personal info, saved addresses, and active sessions from our primary databases.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
