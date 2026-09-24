"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, ShoppingBag, ArrowRight } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: string;
  customerName: string;
  createdAt: string;
  razorpayPaymentId: string | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        setLoggedIn(false);
        return;
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    shipped: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
  };

  if (!loggedIn) {
    return (
      <div className="min-h-[75vh] bg-[#f8f6f1] dark:bg-[#12100e] flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md rounded-[28px] border border-[#e2d5c3] bg-white p-8 text-center shadow-lg dark:border-[#382f25] dark:bg-[#1a1613]">
          <span className="text-5xl">🔐</span>
          <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900 dark:text-white">
            Please Sign In
          </h1>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-300">
            You need to be logged in to view your orders and track live deliveries.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login?redirect=/orders"
              className="rounded-2xl bg-[#c5a059] py-3.5 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663] transition"
            >
              Sign In to View Orders
            </Link>
            <button
              onClick={() => router.back()}
              className="text-xs font-bold text-[#b49663] hover:underline"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 font-sans">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800"
          >
            <ArrowLeft size={16} className="text-[#b49663]" />
            <span>← Go Back</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-bold">
            <Link href="/account" className="text-stone-600 dark:text-stone-300 hover:text-[#b49663]">
              My Account
            </Link>
            <span>•</span>
            <Link href="/shop" className="text-[#b49663] dark:text-[#c5a059] hover:underline">
              Shop Catalog
            </Link>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="rounded-[28px] border border-[#e2d5c3] bg-white p-8 shadow-lg dark:border-[#382f25] dark:bg-[#1a1613] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b49663] dark:text-[#c5a059]">
                LIVE ORDER TRACKING
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">
              My Orders
            </h1>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              Track live dispatch updates and order progress in real-time.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#c5a059] px-5 py-3 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663] transition shrink-0"
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
            <Package className="mx-auto h-14 w-14 text-stone-300 dark:text-stone-700" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">No Orders Yet</h2>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              You haven&apos;t placed any orders yet. Your order history will appear here after checkout.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-2xl bg-[#c5a059] px-6 py-3 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-[#c5a059]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold text-stone-900 dark:text-white">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <span
                        className={`rounded-full px-3 py-0.5 text-[10px] font-bold capitalize ${
                          statusColors[order.status] || "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })} • {order.razorpayPaymentId === "cash_on_delivery" ? "Cash on Delivery" : "Prepaid Online"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-stone-900 dark:text-white">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-bold text-[#b49663] dark:bg-stone-800 dark:text-[#c5a059]">
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
