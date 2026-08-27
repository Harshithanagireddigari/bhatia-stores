"use client";

import { useEffect, useState } from "react";
import { Search, UserCheck, Mail, Phone, Calendar, ShoppingBag, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      // In real scenario, fetch from /api/admin/customers or calculate from users & orders
      const [usersRes, ordersRes] = await Promise.all([
        fetch("/api/users").catch(() => null),
        fetch("/api/orders").catch(() => null),
      ]);

      const users = usersRes && usersRes.ok ? await usersRes.json() : [];
      const orders = ordersRes && ordersRes.ok ? await ordersRes.json() : [];

      const enriched = users.map((u: any) => {
        const userOrders = Array.isArray(orders)
          ? orders.filter((o: any) => o.userId === u.id || o.customerEmail?.toLowerCase() === u.email?.toLowerCase())
          : [];
        const totalSpent = userOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
        return {
          ...u,
          orderCount: userOrders.length,
          totalSpent,
        };
      });

      setCustomers(enriched);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = customers.filter(
    (c) =>
      search.trim() === "" ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Clients & Trade Accounts
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Customer Directory ({customers.length})
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, or phone..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
          />
        </div>

        {/* Customer Table */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading customer directory...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">No registered customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400">
                    <th className="py-3.5 px-4 sm:px-6">Customer / Account</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Role / Type</th>
                    <th className="py-3.5 px-4">Orders Placed</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 font-bold dark:bg-stone-800 dark:text-stone-300">
                            {c.name ? c.name[0].toUpperCase() : "C"}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-white">{c.name || "Customer"}</p>
                            <p className="text-[11px] text-stone-500">ID: {c.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-stone-600 dark:text-stone-300">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Mail size={12} className="text-stone-400" />
                          <span>{c.email}</span>
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                            <Phone size={12} className="text-stone-400" />
                            <span>{c.phone}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                            c.role === "admin"
                              ? "bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                          }`}
                        >
                          {c.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag size={13} className="text-stone-400" />
                          <span>{c.orderCount || 0} orders</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-800 dark:text-amber-400">
                        ₹{(c.totalSpent || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-stone-500">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
