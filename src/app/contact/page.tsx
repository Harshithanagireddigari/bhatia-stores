"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Showroom Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSubmitted(true);
      toast.success("Message sent successfully! Our showroom consultant will get back to you.");
      setForm({ name: "", email: "", phone: "", subject: "Showroom Inquiry", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please reach out via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Showroom & Support
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
            Connect with Bhatia Stores
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Visit our tile and sanitaryware showroom or contact our material consultants for custom project quotes, slab lot matching, and logistics support.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left: Contact Info & Showroom Timings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4 dark:border-stone-800">
                Showroom Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">Location & Address</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Bhatia Sanitary & Tiles Showroom, Main Ring Road, Industrial Area, Sector 4, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">Direct Phone</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      <a href="tel:+919984979720" className="hover:text-purple-900 transition-colors">+91 99849 79720</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">WhatsApp Consultation</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      <a
                        href="https://wa.me/919984979720?text=Hello%20Bhatia%20Stores,%20I%20have%20an%20inquiry%20regarding%20tiles%20and%20sanitaryware."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        +91 99849 79720 (Instant Chat)
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">Email Address</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      <a href="mailto:contact@bhatiastores.com" className="hover:text-purple-900 transition-colors">
                        contact@bhatiastores.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">Showroom Hours</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Monday – Saturday: 9:30 AM – 8:30 PM<br />
                      Sunday: 10:30 AM – 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Banner */}
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-950 dark:text-emerald-200">
              <h4 className="font-serif text-base font-bold">Fast WhatsApp Response</h4>
              <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Need an urgent stock check or tile layout recommendation? Chat directly with our surface specialists.
              </p>
              <a
                href="https://wa.me/919984979720?text=Hello%20Bhatia%20Stores,%20I%20would%20like%20to%20inquire%20about%20your%20tiles."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle size={15} />
                <span>Open WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Right: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-md dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Send an Inquiry or Quote Request
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Provide your details below and our team will get in touch with product availability, prices, and freight schedules.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-2xl bg-emerald-50 p-8 text-center text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <CheckCircle size={44} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                  <h4 className="mt-4 font-serif text-lg font-bold">Inquiry Sent Successfully!</h4>
                  <p className="mt-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                    Thank you for reaching out to Bhatia Stores. A representative will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-5 inline-block text-xs font-semibold underline text-emerald-900 dark:text-emerald-300"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="e.g. Vikram Singhania"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="you@example.com"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Inquiry Topic
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      >
                        <option value="Showroom Inquiry">General Showroom Inquiry</option>
                        <option value="PGVT Glazed Slabs Quote">PGVT Slabs Price Quote</option>
                        <option value="Double Charge Bulk Order">Double Charge Tile Bulk Order</option>
                        <option value="Italian Sanitaryware Consultation">Italian Sanitaryware Consultation</option>
                        <option value="Freight & Regional Dispatch Query">Freight & Dispatch Query</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Message & Material Specifications *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      placeholder="Specify your floor or wall area (sq.ft), desired finishes, or project location..."
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition active:scale-98 disabled:opacity-50 dark:bg-stone-800 dark:hover:bg-purple-800"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Message to Showroom</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
