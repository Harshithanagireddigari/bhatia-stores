"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function HomeContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Tile & Sanitaryware Consultation",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and inquiry details.");
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
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to our showroom team.");
      setForm({ name: "", email: "", phone: "", subject: "Tile & Sanitaryware Consultation", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please reach out on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="border-t border-stone-200/80 bg-white py-16 lg:py-24 dark:border-stone-800 dark:bg-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: Showroom Info & Concierge Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <MapPin size={13} />
                <span>Showroom & Support</span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-white">
                Visit or Connect with Bhatia Stores
              </h2>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed dark:text-stone-300">
                Have questions about surface dimensions, shade lot numbers, tile quantities, or custom sanitaryware delivery? Our showroom consultants are available 7 days a week.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                  <MapPin size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">Showroom Address</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                    Bhatia Sanitary & Tiles Showroom, Main Ring Road, Industrial Area, Sector 4, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <Phone size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">Phone Support</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    <a href="tel:+919984979720" className="hover:text-purple-900 transition-colors">+91 99849 79720</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  <MessageCircle size={19} />
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
                      +91 99849 79720 (Instant Quote)
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                  <Clock size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">Showroom Timings</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Monday – Saturday: 9:30 AM – 8:30 PM<br />
                    Sunday: 10:30 AM – 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Contact & Quote Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-stone-200/90 bg-[#FAF8F5] p-6 sm:p-8 shadow-md dark:border-stone-800 dark:bg-stone-950">
              <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Request a Custom Quote / Layout Guidance
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Send your room dimensions or tile requirements, and our surface expert will prepare a comprehensive estimate.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl bg-emerald-50 p-6 text-center text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <CheckCircle size={40} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                  <h4 className="mt-3 text-lg font-bold">Inquiry Successfully Received</h4>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Our showroom team has received your message and will reach out to you within 2-4 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 inline-block text-xs font-semibold underline text-emerald-800 dark:text-emerald-300"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="e.g. Ramesh Patel"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
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
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Phone Number (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Inquiry Category
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                      >
                        <option value="Tile & Sanitaryware Consultation">General Tile Consultation</option>
                        <option value="Bulk Project / Builder Quote">Bulk Builder / Contractor Pricing</option>
                        <option value="PGVT Vitrified Slabs Inquiry">PGVT 600x1200 Slabs Inquiry</option>
                        <option value="Italian Sanitaryware Inquiry">Italian Bathroom Suites Inquiry</option>
                        <option value="Order Dispatch & Delivery Query">Order Dispatch & Delivery Query</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Message & Requirements *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={4}
                      placeholder="Specify your approximate room size (sq.ft), desired tile finish (Glossy/Matt), or product names..."
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:bg-purple-900 active:scale-98 disabled:opacity-50 dark:bg-stone-800 dark:hover:bg-purple-800"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Inquiry to Showroom</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
