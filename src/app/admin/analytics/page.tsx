"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Truck,
  Users,
  Calendar,
  Layers,
  BarChart3,
  PieChart,
} from "lucide-react";

interface Order {
  id: string;
  total: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items?: { quantity: number; productName: string; price: string }[];
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "3m" | "1y" | "all">("30d");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter orders based on time range
  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    if (timeRange === "all") return true;
    const date = new Date(o.createdAt);
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

    if (timeRange === "7d") return diffDays <= 7;
    if (timeRange === "30d") return diffDays <= 30;
    if (timeRange === "3m") return diffDays <= 90;
    if (timeRange === "1y") return diffDays <= 365;
    return true;
  });

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Payment Breakdown
  const prepaidOrders = filteredOrders.filter((o) => o.paymentMethod !== "cod");
  const codOrders = filteredOrders.filter((o) => o.paymentMethod === "cod");

  const prepaidRevenue = prepaidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const codRevenue = codOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Status breakdown
  const statusCounts = {
    pending: filteredOrders.filter((o) => o.status === "pending").length,
    confirmed: filteredOrders.filter((o) => o.status === "confirmed").length,
    processing: filteredOrders.filter((o) => o.status === "processing").length,
    shipped: filteredOrders.filter((o) => o.status === "shipped").length,
    delivered: filteredOrders.filter((o) => o.status === "delivered").length,
    cancelled: filteredOrders.filter((o) => o.status === "cancelled").length,
  };

  // Group by day for simple visual chart bar heights
  const daysMap: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    const d = new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    daysMap[d] = (daysMap[d] || 0) + Number(o.total || 0);
  });

  const chartEntries = Object.entries(daysMap).slice(-7);
  const maxDayRevenue = Math.max(...Object.values(daysMap), 1);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Header & Time Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Executive Intelligence
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Financial & Sales Analytics
            </h1>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900 shadow-xs">
            {(
              [
                { key: "7d", label: "7 Days" },
                { key: "30d", label: "30 Days" },
                { key: "3m", label: "3 Months" },
                { key: "1y", label: "1 Year" },
                { key: "all", label: "All Time" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeRange(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  timeRange === tab.key
                    ? "bg-purple-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
              <span className="rounded-full bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                <DollarSign size={16} />
              </span>
            </div>
            <p className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">
              ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-stone-500">Over selected period ({timeRange.toUpperCase()})</p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Consignments</span>
              <span className="rounded-full bg-purple-100 p-2 text-purple-900 dark:bg-purple-950/40 dark:text-purple-400">
                <ShoppingBag size={16} />
              </span>
            </div>
            <p className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">
              {totalOrders}
            </p>
            <p className="mt-1 text-xs text-stone-500">Completed & dispatched orders</p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Average Order Value</span>
              <span className="rounded-full bg-amber-100 p-2 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                <TrendingUp size={16} />
              </span>
            </div>
            <p className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">
              ₹{aov.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-stone-500">Average ticket per checkout</p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Prepaid Ratio</span>
              <span className="rounded-full bg-sky-100 p-2 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400">
                <CreditCard size={16} />
              </span>
            </div>
            <p className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">
              {totalOrders > 0 ? Math.round((prepaidOrders.length / totalOrders) * 100) : 0}%
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {prepaidOrders.length} Prepaid vs {codOrders.length} COD
            </p>
          </div>
        </div>

        {/* Visual Revenue Activity */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                Revenue Trajectory & Daily Billing
              </h3>
              <p className="text-xs text-stone-500">Aggregated tile sales over recent activity</p>
            </div>
          </div>

          {chartEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500">
              No sales activity recorded in this time bracket yet.
            </div>
          ) : (
            <div className="mt-4 flex items-end justify-between gap-4 h-48 pt-6 border-b border-stone-200 dark:border-stone-800 pb-2">
              {chartEntries.map(([day, rev]) => {
                const heightPercent = Math.max(15, Math.round((rev / maxDayRevenue) * 100));
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-purple-900 opacity-0 group-hover:opacity-100 transition dark:text-amber-400">
                      ₹{rev.toFixed(0)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-purple-900 to-amber-600 transition-all duration-300 hover:brightness-110"
                    />
                    <span className="text-[11px] font-medium text-stone-500">{day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment & Order Pipeline Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Method Comparison */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white mb-4">
              Payment Gateway vs COD Distribution
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span>Prepaid Instant (Direct Gateway)</span>
                  <span>
                    ₹{prepaidRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({prepaidOrders.length}{" "}
                    orders)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    style={{
                      width: totalRevenue > 0 ? `${(prepaidRevenue / totalRevenue) * 100}%` : "0%",
                    }}
                    className="h-full bg-purple-900 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span>Cash on Delivery (Pay upon Unloading)</span>
                  <span>
                    ₹{codRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({codOrders.length} orders)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    style={{
                      width: totalRevenue > 0 ? `${(codRevenue / totalRevenue) * 100}%` : "0%",
                    }}
                    className="h-full bg-amber-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Consignment Status Pipeline */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white mb-4">
              Order Fulfillment Breakdown
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(statusCounts).map(([st, count]) => (
                <div
                  key={st}
                  className="rounded-2xl border border-stone-100 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/40"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 capitalize">{st}</p>
                  <p className="mt-1 font-serif text-xl font-bold text-stone-900 dark:text-white">{count}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
