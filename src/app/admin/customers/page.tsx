"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { toast } from "sonner";
import {
  Search,
  UserCheck,
  ShoppingBag,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  UserX,
  Globe,
  Radio,
  Trash2,
  Ban,
  ArrowRight,
  Monitor,
} from "lucide-react";
import type { VisitorLogEntry } from "@/app/api/track-visit/route";

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
  const [activeTab, setActiveTab] = useState<"customers" | "visitors" | "restricted">("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visitors, setVisitors] = useState<VisitorLogEntry[]>([]);
  const [restrictedUsers, setRestrictedUsers] = useState<string[]>([]);
  const [updatingRestrictedId, setUpdatingRestrictedId] = useState<string | null>(null);
  const [manualIdentifier, setManualIdentifier] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [clearingVisitors, setClearingVisitors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadAllData(silent = false) {
    try {
      const [insightsRes, restrictRes, visitorsRes] = await Promise.all([
        fetch("/api/admin/insights").then((r) => r.json()).catch(() => ({ customers: [] })),
        fetch("/api/admin/customers/restrict").then((r) => r.json()).catch(() => ({ restrictedUsers: [] })),
        fetch("/api/admin/visitors").then((r) => r.json()).catch(() => ({ visitors: [] })),
      ]);

      if (Array.isArray(insightsRes.customers)) setCustomers(insightsRes.customers);
      if (Array.isArray(restrictRes.restrictedUsers)) setRestrictedUsers(restrictRes.restrictedUsers);
      if (Array.isArray(visitorsRes.visitors)) setVisitors(visitorsRes.visitors);
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();

    // Auto-refresh every 5 seconds for live real-time visitor monitoring
    const interval = setInterval(() => {
      loadAllData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function toggleRestriction(
    identifier: string,
    userId: string | null = null,
    shouldRestrict: boolean,
    label?: string
  ) {
    const targetLabel = label || identifier;
    const actionText = shouldRestrict ? "block / restrict" : "restore access for";
    if (!window.confirm(`Are you sure you want to ${actionText} "${targetLabel}"?`)) {
      return;
    }

    setUpdatingRestrictedId(identifier);
    try {
      const res = await fetch("/api/admin/customers/restrict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          userId,
          restricted: shouldRestrict,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update restriction");
      setRestrictedUsers(data.restrictedUsers || []);
      toast.success(
        shouldRestrict
          ? `⛔ "${targetLabel}" restricted from website access and ordering.`
          : `✅ Access restored for "${targetLabel}".`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating restriction");
    } finally {
      setUpdatingRestrictedId(null);
    }
  }

  async function handleManualBlock(e: React.FormEvent) {
    e.preventDefault();
    const clean = manualIdentifier.trim().toLowerCase();
    if (!clean) return;

    setManualLoading(true);
    try {
      const res = await fetch("/api/admin/customers/restrict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: clean,
          restricted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restrict target");
      setRestrictedUsers(data.restrictedUsers || []);
      toast.success(`⛔ Added "${clean}" to restricted blocklist.`);
      setManualIdentifier("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restrict");
    } finally {
      setManualLoading(false);
    }
  }

  async function clearVisitors() {
    if (!window.confirm("Are you sure you want to clear all recorded visitor activity logs?")) return;
    setClearingVisitors(true);
    try {
      const res = await fetch("/api/admin/visitors", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear logs");
      toast.success("Visitor logs cleared successfully");
      setVisitors([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear logs");
    } finally {
      setClearingVisitors(false);
    }
  }

  const isIdentifierRestricted = (idOrEmailOrIp: string) => {
    const list = restrictedUsers.map((x) => String(x).toLowerCase().trim());
    return list.includes(idOrEmailOrIp.toLowerCase().trim());
  };

  const isCustomerRestricted = (c: Customer) => {
    return isIdentifierRestricted(c.id) || isIdentifierRestricted(c.email);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const filteredVisitors = visitors.filter(
    (v) =>
      v.ip.includes(search) ||
      v.path.toLowerCase().includes(search.toLowerCase()) ||
      v.userName.toLowerCase().includes(search.toLowerCase()) ||
      (v.userEmail && v.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      v.device.toLowerCase().includes(search.toLowerCase())
  );

  const restrictedCount = restrictedUsers.length;

  function formatTimeAgo(dateString: string) {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
      if (diffSec < 10) return "Just now";
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(dateString).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 pb-20 md:pb-0 min-w-0">
        <Header />
        <main className="p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Visitors & Customer Access Control
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Monitor whoever visits your website in real-time, inspect their traffic, restrict unwanted visitors, and manage customer accounts.
              </p>
            </div>

            {/* Quick Actions / Link to Orders Deletion */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span>Manage & Delete Orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Customer & Visitor Metrics Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                  <Radio size={20} className="animate-pulse text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Live Traffic Logs</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{visitors.length} visits</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Customer Spend</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <UserX size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Restricted Targets</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{restrictedCount} blocked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Manual Restrict Bar */}
          <div className="mb-6 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50/80 to-amber-50/60 p-4 dark:border-red-950/60 dark:from-red-950/30 dark:to-stone-900 shadow-sm">
            <form onSubmit={handleManualBlock} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300 shrink-0">
                <Ban size={15} />
                <span>Instant Restrict / Block:</span>
              </div>
              <input
                type="text"
                value={manualIdentifier}
                onChange={(e) => setManualIdentifier(e.target.value)}
                placeholder="Enter IP address (e.g. 103.24.56.78) or email to restrict..."
                className="flex-1 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-900/60 dark:bg-stone-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={manualLoading || !manualIdentifier.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50 shadow-sm shrink-0"
              >
                {manualLoading ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
                <span>Block / Restrict</span>
              </button>
            </form>
          </div>

          {/* Tabs Navigation & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "customers"
                    ? "bg-[#b49663] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Registered Customers ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab("visitors")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "visitors"
                    ? "bg-[#b49663] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Radio size={12} className="animate-pulse text-emerald-400" />
                <span>Live Website Visitors ({visitors.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("restricted")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "restricted"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Blocked List ({restrictedCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, email, or IP..."
                className="w-full rounded-2xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-xs text-gray-900 outline-none transition focus:border-[#b49663] focus:ring-1 focus:ring-[#b49663] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* TAB 1: Registered Customers */}
          {activeTab === "customers" && (
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 dark:bg-gray-900/60 dark:border-gray-700 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Total Orders</th>
                    <th className="px-6 py-4">Lifetime Spend</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Access & Restriction</th>
                    <th className="px-6 py-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Loading customer records...
                      </td>
                    </tr>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c) => {
                      const avatarLetter = (c.name || c.email || "C").charAt(0).toUpperCase();
                      const restricted = isCustomerRestricted(c);
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
                            <Link
                              href="/admin/orders"
                              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
                            >
                              <ShoppingBag size={12} /> {c.orderCount} orders
                            </Link>
                          </td>

                          {/* Lifetime Spend */}
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-sm">
                            ₹{c.totalSpent.toLocaleString("en-IN")}
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            {c.role === "admin" ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                Admin
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                Customer
                              </span>
                            )}
                          </td>

                          {/* Access & Restriction Control */}
                          <td className="px-6 py-4">
                            {c.role === "admin" ? (
                              <span className="text-[11px] font-semibold text-gray-400 italic">
                                Unrestricted
                              </span>
                            ) : restricted ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-800 dark:bg-red-950/60 dark:text-red-300">
                                  <ShieldAlert size={12} /> Restricted
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleRestriction(c.email, c.id, false, c.name)}
                                  disabled={updatingRestrictedId === c.email || updatingRestrictedId === c.id}
                                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
                                >
                                  {updatingRestrictedId === c.email || updatingRestrictedId === c.id ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    "Restore Access"
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  <ShieldCheck size={12} /> Active
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleRestriction(c.email, c.id, true, c.name)}
                                  disabled={updatingRestrictedId === c.email || updatingRestrictedId === c.id}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition"
                                >
                                  {updatingRestrictedId === c.email || updatingRestrictedId === c.id ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    "Restrict Access"
                                  )}
                                </button>
                              </div>
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
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No customer accounts matching "{search}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Live Website Visitors */}
          {activeTab === "visitors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Visitor Feed Active (Auto-updating every 5s)
                </div>
                {visitors.length > 0 && (
                  <button
                    onClick={clearVisitors}
                    disabled={clearingVisitors}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <Trash2 size={13} />
                    <span>{clearingVisitors ? "Clearing..." : "Clear Visitor Log"}</span>
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 dark:bg-gray-900/60 dark:border-gray-700 dark:text-gray-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Visitor Identity</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">Page Visited</th>
                      <th className="px-6 py-4">Device & Browser</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Control & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredVisitors.length > 0 ? (
                      filteredVisitors.map((v) => {
                        const isIpBlocked = isIdentifierRestricted(v.ip);
                        const isUserBlocked = v.userEmail ? isIdentifierRestricted(v.userEmail) : false;
                        const blocked = isIpBlocked || isUserBlocked;

                        return (
                          <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition">
                            {/* Visitor Identity */}
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {v.userName}
                                </p>
                                {v.userEmail ? (
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                    {v.userEmail}
                                  </p>
                                ) : (
                                  <span className="inline-block rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-stone-700 dark:text-stone-300 font-medium">
                                    Anonymous Guest
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* IP Address */}
                            <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-white">
                              {v.ip}
                            </td>

                            {/* Page Visited */}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {v.path}
                              </span>
                            </td>

                            {/* Device & Browser */}
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1.5">
                                <Monitor size={13} className="text-gray-400" />
                                <span>{v.device}</span>
                              </div>
                            </td>

                            {/* Timestamp */}
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatTimeAgo(v.timestamp)}
                            </td>

                            {/* Control & Action */}
                            <td className="px-6 py-4">
                              {blocked ? (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-800 dark:bg-red-950/60 dark:text-red-300">
                                    <ShieldAlert size={12} /> Restricted
                                  </span>
                                  <button
                                    onClick={() => toggleRestriction(v.ip, null, false, `IP ${v.ip}`)}
                                    disabled={updatingRestrictedId === v.ip}
                                    className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                  >
                                    Unblock IP
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => toggleRestriction(v.ip, null, true, `IP ${v.ip}`)}
                                  disabled={updatingRestrictedId === v.ip}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
                                >
                                  <Ban size={12} />
                                  <span>Block / Restrict IP</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-500">
                          <Globe size={28} className="mx-auto mb-2 text-gray-400" />
                          <p className="font-semibold text-gray-800 dark:text-gray-200">No visitor activity recorded yet.</p>
                          <p className="text-xs text-gray-400 mt-1">Visitors browsing your store will automatically appear here in real-time.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Blocked & Restricted Targets */}
          {activeTab === "restricted" && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                Currently Restricted Identifiers & IPs ({restrictedUsers.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                These users and IP addresses are completely blocked from logging in, checking out, and accessing store services.
              </p>

              {restrictedUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <ShieldCheck size={36} className="mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold text-gray-800 dark:text-gray-200">No users or IP addresses are currently restricted.</p>
                  <p className="text-xs text-gray-400 mt-1">You can block any IP or customer using the form above or the tables.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {restrictedUsers.map((item) => (
                    <div key={item} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                          <Ban size={14} />
                        </span>
                        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {item}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleRestriction(item, null, false, item)}
                        disabled={updatingRestrictedId === item}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {updatingRestrictedId === item ? <Loader2 size={12} className="animate-spin" /> : "Remove Restriction"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
