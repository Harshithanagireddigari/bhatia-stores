"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const supportPhone = "+91 91204 35950";
  const supportEmail = "bhatiasanitaryware@gmail.com";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      toast.success("Thank you! Your message has been sent to Bhatia Stores customer care.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
          >
            <ArrowLeft size={16} className="text-[#b49663]" />
            <span>← Go Back</span>
          </button>

          <Link href="/" className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
            Return to Home Page
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="rounded-[28px] border border-[#e2d5c3] bg-white p-8 sm:p-10 text-center shadow-lg dark:border-[#382f25] dark:bg-[#1a1613] mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b49663] dark:text-[#c5a059]">
            THE BHATIAS SUPPORT
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
            Contact Bhatia Stores
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs text-stone-600 dark:text-stone-300">
            Have questions about tiles, sanitaryware, or order tracking? Our experts are here to assist you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Direct Contact Info */}
          <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-3 dark:border-stone-800">
              Get in Touch
            </h2>

            <div className="space-y-4 text-xs">
              <a href="tel:+919120435950" className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 hover:border-[#b49663] transition dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Phone Support</p>
                  <p className="text-stone-500">{supportPhone}</p>
                </div>
              </a>

              <a href="https://wa.me/919120435950" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 hover:border-[#b49663] transition dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">WhatsApp Enquiry</p>
                  <p className="text-stone-500">Instant Chat (+91 91204 35950)</p>
                </div>
              </a>

              <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 hover:border-[#b49663] transition dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Email Desk</p>
                  <p className="text-stone-500 break-all">{supportEmail}</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Main Showroom</p>
                  <p className="text-stone-500">Bhatia Stores, Main Hardware Market, New Delhi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-3 dark:border-stone-800 mb-4">
              Send a Direct Message
            </h2>

            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Message / Requirements *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your requirements or tile selection inquiry..."
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#c5a059] py-3.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition"
              >
                {loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
