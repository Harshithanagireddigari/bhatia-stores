"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

type Offer = {
  id: string;
  title: string;
  code: string | null;
  discountType: string;
  discountValue: string;
  expiresAt: string | null;
  isActive: number;
};

export default function AdminOffersPage() {
  const [items, setItems] = useState<Offer[]>([]);
  const [form, setForm] = useState({ title: "", code: "", discountValue: "", expiresAt: "" });

  const load = () =>
    fetch("/api/admin/offers")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  async function add(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return toast.error("Could not create offer");
    setForm({ title: "", code: "", discountValue: "", expiresAt: "" });
    toast.success("Offer created");
    load();
  }

  async function update(id: string, isActive: boolean) {
    await fetch("/api/admin/offers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this offer?")) return;
    await fetch("/api/admin/offers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 pb-20 md:pb-0 min-w-0">
        <Header />
        <main className="max-w-5xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offers</h1>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Create promotions and coupons, then toggle them as campaigns start or end.
          </p>

          <form
            onSubmit={add}
            className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <input
              required
              placeholder="Offer title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <input
              placeholder="Coupon code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <input
              required
              type="number"
              placeholder="Discount %"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              className="rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white sm:col-span-2 lg:col-span-4 hover:bg-indigo-700 transition">
              Create offer
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {Array.isArray(items) && items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {item.title} <span className="text-indigo-600">{item.discountValue}% off</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.code ? `Code: ${item.code}` : "No coupon code"}
                      {item.expiresAt ? ` · Ends ${new Date(item.expiresAt).toLocaleDateString("en-IN")}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => update(item.id, !item.isActive)}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="rounded-lg px-3 py-1 text-xs font-bold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-gray-500">No offers created yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
