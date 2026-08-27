"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Rocket,
  Settings,
  BarChart3,
  ArrowRight,
  Truck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics?range=30days");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard analytics error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-stone-200 dark:bg-stone-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  };

  const statusCounts = data?.statusDistribution || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  const topProducts = data?.topSellingProducts || [];
  const lowStock = data?.lowStockProducts || [];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Operations Control
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Bhatia Stores Admin Dashboard
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Real-time showroom metrics, inventory velocity, and dispatch status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/products?action=new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800 transition"
            >
              <Plus size={14} />
              <span>+ Add Product</span>
            </Link>

            <Link
              href="/admin/launchpad"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50 transition dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <Rocket size={14} />
              <span>Launchpad</span>
            </Link>

            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50 transition dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <Settings size={14} />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Total Net Sales
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-white">
              ₹{Number(kpis.totalRevenue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              Avg Order: ₹{Number(kpis.averageOrderValue).toFixed(2)}
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Total Orders
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <ShoppingCart size={20} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-white">
              {kpis.totalOrders}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {statusCounts.delivered} Delivered • {statusCounts.pending + statusCounts.confirmed} Pending
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Total Customers
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                <Users size={20} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-white">
              {kpis.totalCustomers}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">Registered Accounts</p>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Products in Catalog
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <Package size={20} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-white">
              {kpis.totalProducts}
            </p>
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              {lowStock.length} Low Stock Alerts
            </p>
          </div>
        </div>

        {/* Order Status Distribution Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">Pending</span>
            <p className="font-serif text-2xl font-bold text-amber-600 mt-1">{statusCounts.pending}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">Confirmed</span>
            <p className="font-serif text-2xl font-bold text-blue-600 mt-1">{statusCounts.confirmed}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">Processing</span>
            <p className="font-serif text-2xl font-bold text-purple-600 mt-1">{statusCounts.processing || 0}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">In Transit</span>
            <p className="font-serif text-2xl font-bold text-indigo-600 mt-1">{statusCounts.shipped}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">Delivered</span>
            <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">{statusCounts.delivered}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">Cancelled</span>
            <p className="font-serif text-2xl font-bold text-stone-400 mt-1">{statusCounts.cancelled}</p>
          </div>
        </div>

        {/* 2-Column Grid: Top Products & Low Stock Alerts */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Top Selling Products (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Top-Selling Surfaces & Suites
                </h3>
                <Link
                  href="/admin/analytics"
                  className="text-xs font-semibold text-purple-900 hover:underline dark:text-amber-400"
                >
                  Full Analytics →
                </Link>
              </div>

              {topProducts.length === 0 ? (
                <p className="py-8 text-center text-xs text-stone-500">No sales transactions recorded in this period.</p>
              ) : (
                <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
                  {topProducts.map((p: any) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-11 w-11 shrink-0 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                        />
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white truncate">
                            {p.name}
                          </p>
                          <span className="text-[11px] text-stone-500">{p.category}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                          ₹{Number(p.revenue).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-stone-500">{p.units} boxes sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Low-Stock Inventory Warnings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={17} className="text-amber-600" />
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                    Low-Stock Alerts
                  </h3>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-purple-900 hover:underline dark:text-amber-400"
                >
                  Manage Stock →
                </Link>
              </div>

              {lowStock.length === 0 ? (
                <p className="py-8 text-center text-xs text-stone-500">All catalog stock levels are healthy (&gt; 25 units).</p>
              ) : (
                <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
                  {lowStock.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="truncate min-w-0">
                        <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <span className="text-[11px] text-stone-500">{item.category}</span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          item.stock <= 5
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {item.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
