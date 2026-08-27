"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ArrowLeft, ShoppingBag, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string;
  productImage?: string;
}

interface Order {
  id: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: string;
  customerName: string;
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  pending: { label: "Pending Verification", badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300", icon: Clock },
  confirmed: { label: "Confirmed", badgeClass: "bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300", icon: CheckCircle },
  processing: { label: "Processing & Packaging", badgeClass: "bg-purple-100 text-purple-900 dark:bg-purple-950/50 dark:text-purple-300", icon: Package },
  shipped: { label: "In Transit / Shipped", badgeClass: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300", icon: Truck },
  delivered: { label: "Delivered", badgeClass: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300", icon: CheckCircle },
  cancelled: { label: "Cancelled", badgeClass: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          setLoggedIn(false);
          return;
        }
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (!loggedIn) {
    return (
      <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[75vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-12 shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
            <Package size={32} />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-bold text-stone-900 dark:text-white">
            Customer Sign In Required
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Please sign in to your Bhatia Stores account to view your past tile dispatches and order history.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-stone-900 py-3.5 text-xs font-semibold text-white shadow-md hover:bg-purple-900 transition"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Customer Hub
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              My Orders & Dispatches
            </h1>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-amber-700 dark:text-amber-400 transition"
          >
            <ShoppingBag size={14} />
            <span>Browse Tile Catalog</span>
          </Link>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 h-28"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-16 text-center rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 dark:border-stone-800 dark:bg-stone-900/60">
            <Package size={48} className="mx-auto text-stone-400" />
            <h3 className="mt-4 font-serif text-xl font-bold text-stone-900 dark:text-white">
              No orders placed yet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              Your past material orders and dispatch tracking will appear here once you place your first order.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white hover:bg-purple-900 transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((ord) => {
              const statusInfo = STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusInfo.icon;
              const paymentLabel = ord.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid";

              return (
                <Link
                  key={ord.id}
                  href={`/orders/${ord.id}`}
                  className="group block rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs transition hover:border-amber-600/40 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-stone-900 dark:text-white">
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                        ₹{parseFloat(ord.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>

                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Payment: <strong>{paymentLabel}</strong> {ord.items && `• ${ord.items.length} item(s)`}
                      </p>
                    </div>

                    {/* Right status & link */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-800">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
                      >
                        <StatusIcon size={13} />
                        <span>{statusInfo.label}</span>
                      </span>

                      <div className="flex items-center gap-1 text-xs font-semibold text-purple-900 group-hover:text-amber-700 dark:text-amber-400 transition">
                        <span>View Details</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
