"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
type Customer = { id: string; name: string; email: string; createdAt: string };
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/insights").then((r) => r.json()).then((d) => setCustomers(d.customers || [])).finally(() => setLoading(false)); }, []);
  return <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900"><Sidebar /><div className="ml-64 flex-1"><Header /><main className="p-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1><p className="mb-6 text-sm text-gray-500">Customer account information and signup history.</p><div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 dark:bg-gray-700"><tr><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Joined</th></tr></thead><tbody>{loading ? <tr><td colSpan={3} className="p-6 text-center text-gray-500">Loading customers…</td></tr> : customers.length ? customers.map((c) => <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td><td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.email}</td><td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td></tr>) : <tr><td colSpan={3} className="p-6 text-center text-gray-500">No customers yet.</td></tr>}</tbody></table></div></main></div></div>;
}
