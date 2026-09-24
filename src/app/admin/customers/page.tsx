"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Search, UserCheck, ShoppingBag, CreditCard, Calendar, Phone, Mail } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/insights")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch((err) => console.error("Failed to load customer records:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Customer Database
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Real customer account profiles, order histories, and lifetime spend records.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, or phone..."
                className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-[#b49663] focus:ring-1 focus:ring-[#b49663] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Customer Metrics Overview */}
          <div className="grid gap-5 sm:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Registered</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{customers.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Buyers</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {customers.filter((c) => c.orderCount > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Lifetime Spend</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 dark:bg-gray-900/60 dark:border-gray-700 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Total Orders</th>
                  <th className="px-6 py-4">Lifetime Spend</th>
                  <th className="px-6 py-4">Role / Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Loading customer records...
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => {
                    const avatarLetter = (c.name || c.email || "C").charAt(0).toUpperCase();
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition">
                        {/* Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a3373] text-xs font-bold text-white shadow-sm">
                              {avatarLetter}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p>
                              <p className="text-[11px] text-gray-400 font-mono">ID: {c.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                              <Mail size={13} className="text-gray-400" />
                              <span>{c.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px]">
                              <Phone size={12} className="text-gray-400" />
                              <span>{c.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Total Orders */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            <ShoppingBag size={12} /> {c.orderCount} orders
                          </span>
                        </td>

                        {/* Lifetime Spend */}
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-sm">
                          ₹{c.totalSpent.toLocaleString("en-IN")}
                        </td>

                        {/* Role / Status */}
                        <td className="px-6 py-4">
                          {c.role === "admin" ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Admin Role
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              Verified Customer
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            <span>{new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No customer accounts matching "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
