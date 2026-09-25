"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Send, CheckCircle, Building2, UploadCloud, Phone, ShieldCheck } from "lucide-react";

export default function BOQPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "residential",
    city: "",
    estimatedBudget: "",
    notes: "",
    fileUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/boq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(json.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          projectType: "residential",
          city: "",
          estimatedBudget: "",
          notes: "",
          fileUrl: "",
        });
      } else {
        setErrorMsg(json.error || "Failed to submit BOQ request.");
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header Hero */}
        <div className="rounded-[32px] border border-[#e2d5c3] bg-white p-8 sm:p-12 shadow-xl dark:border-[#382f25] dark:bg-[#1a1613] text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-stone-100 dark:bg-stone-800 text-[#b49663] dark:text-[#c5a059]">
            <Building2 className="h-4 w-4" /> B2B & Commercial Quotations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
            Bill of Quantities (BOQ) & Project Pricing
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Planning a luxury home, villa, hotel, or commercial development? Submit your architectural plans or product list for direct trade discounts & wholesale BOQ quotation from Bhatia Stores.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-lg dark:border-stone-800 dark:bg-stone-900">
          {successMsg ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Request Received!
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto">
                {successMsg}
              </p>
              <button
                onClick={() => setSuccessMsg("")}
                className="mt-4 inline-block rounded-2xl bg-[#c5a059] px-6 py-3 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663]"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs font-bold rounded-2xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh@architecture.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Phone / Whatsapp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Project Type *
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  >
                    <option value="residential">Residential Villa / Apartment</option>
                    <option value="commercial">Commercial Office / Mall</option>
                    <option value="hotel">Hotel / Hospitality Resort</option>
                    <option value="builder">Builder / Multi-Unit Housing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Estimated Budget Range (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹5 Lakhs - ₹15 Lakhs"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    BOQ File / Plan Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Google Drive, Dropbox or Image URL"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Project Notes & Product Requirements
                </label>
                <textarea
                  rows={4}
                  placeholder="Specify required brands, finishes (Matt Black, Brushed Gold, Chrome), quantities, or target completion date..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-[#b49663]"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Strict NDA & Price Confidentiality Guaranteed</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#c5a059] px-8 py-4 text-xs font-extrabold text-stone-900 shadow-lg hover:bg-[#b49663] transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? "Submitting Request..." : "Request BOQ Quotation"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
