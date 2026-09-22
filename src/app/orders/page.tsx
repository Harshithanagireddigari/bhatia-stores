"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  total: string;
  customerName: string;
  createdAt: string;
  razorpayPaymentId: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

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
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <span className="text-6xl">🔐</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Please log in
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You need to be logged in to view your orders.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="text-6xl">📦</span>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{parseFloat(order.total).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusColors[order.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
