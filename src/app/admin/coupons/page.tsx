"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Plus, Tag, Pencil, Trash2, Check, LoaderCircle, Calendar, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  isFirstOrderOnly: number;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  expiryDate: string | null;
  isActive: number;
};

const emptyForm = {
  code: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: "",
  isFirstOrderOnly: false,
  minOrderAmount: "2000",
  maxDiscountAmount: "1000",
  usageLimit: "500",
  startDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons?all=true", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCoupons();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editCoupon(cpn: Coupon) {
    setEditingId(cpn.id);
    setForm({
      code: cpn.code,
      discountType: cpn.discountType,
      discountValue: cpn.discountValue,
      isFirstOrderOnly: cpn.isFirstOrderOnly === 1,
      minOrderAmount: cpn.minOrderAmount || "0",
      maxDiscountAmount: cpn.maxDiscountAmount || "",
      usageLimit: cpn.usageLimit ? String(cpn.usageLimit) : "",
      startDate: cpn.startDate ? new Date(cpn.startDate).toISOString().split("T")[0] : "",
      expiryDate: cpn.expiryDate ? new Date(cpn.expiryDate).toISOString().split("T")[0] : "",
      isActive: cpn.isActive === 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast.error("Coupon Code and Discount Value are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        isFirstOrderOnly: form.isFirstOrderOnly,
        minOrderAmount: form.minOrderAmount,
        maxDiscountAmount: form.maxDiscountAmount,
        usageLimit: form.usageLimit,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        isActive: form.isActive,
      };

      const res = await fetch("/api/coupons", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save coupon");

      toast.success(editingId ? "Coupon updated successfully" : "New coupon created!");
      resetForm();
      await loadCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCoupon(cpn: Coupon) {
    if (!confirm(`Delete coupon "${cpn.code}"?`)) return;
    try {
      const res = await fetch(`/api/coupons?id=${cpn.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Coupon deleted");
        await loadCoupons();
      }
    } catch {
      toast.error("Failed to delete coupon");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6 max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="text-amber-500" size={24} />
                <span>Coupons & Offer Conditions</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage promotional discount codes with strict order conditions (first order only, minimum total, max cap).
              </p>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-full border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* CREATE / EDIT FORM CARD (Matches Image 4) */}
          <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {editingId ? "Edit Coupon Code" : "Create New Coupon"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WELCOME10"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-mono font-bold uppercase text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-semibold text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Discount Value ({form.discountType === "percentage" ? "%" : "₹"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "percentage" ? "10" : "500"}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* CONDITIONS ROW */}
              <div className="grid gap-5 md:grid-cols-4">
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-gray-700 dark:bg-gray-900">
                  <label className="flex cursor-pointer items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={form.isFirstOrderOnly}
                      onChange={(e) => setForm({ ...form, isFirstOrderOnly: e.target.checked })}
                      className="h-4 w-4 rounded accent-amber-600"
                    />
                    <span>First Order Only</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="2000"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Maximum Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="1000"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="500"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* DATES & STATUS ROW */}
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-gray-700 dark:bg-gray-900">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Active Status</p>
                    <p className="text-[11px] text-gray-500">Live coupons are available at checkout</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`h-6 w-11 rounded-full p-0.5 transition ${
                      form.isActive ? "bg-amber-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition ${
                        form.isActive ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-amber-600 px-8 py-3 text-xs font-bold text-white shadow hover:bg-amber-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <LoaderCircle className="animate-spin h-4 w-4" />}
                  <span>{editingId ? "Update Coupon" : "Save Coupon"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* LIST OF CREATED COUPONS */}
          <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Active Store Coupons ({coupons.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading coupons…</div>
            ) : coupons.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 font-bold uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-700/50">
                    <tr>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5">Conditions</th>
                      <th className="p-3.5">Usage</th>
                      <th className="p-3.5">Expiry</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {coupons.map((cpn) => (
                      <tr key={cpn.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {cpn.code}
                        </td>
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                          {cpn.discountType === "percentage"
                            ? `${cpn.discountValue}% OFF`
                            : `₹${Number(cpn.discountValue).toLocaleString("en-IN")} OFF`}
                          {cpn.maxDiscountAmount && (
                            <span className="block text-[10px] font-normal text-gray-500">
                              Max ₹{Number(cpn.maxDiscountAmount).toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 space-y-0.5">
                          {cpn.isFirstOrderOnly === 1 && (
                            <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              First Order Only
                            </span>
                          )}
                          {Number(cpn.minOrderAmount || 0) > 0 && (
                            <span className="block text-[11px] text-gray-600 dark:text-gray-400">
                              Min. order ₹{Number(cpn.minOrderAmount).toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-gray-300 font-medium">
                          {cpn.usedCount} / {cpn.usageLimit || "∞"} used
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-gray-400">
                          {cpn.expiryDate
                            ? new Date(cpn.expiryDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "No Expiry"}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              cpn.isActive === 1
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {cpn.isActive === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => editCoupon(cpn)}
                            className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => deleteCoupon(cpn)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No coupons added yet. Create one above!</p>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
