"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  phone: string;
  status: string;
  total: string;
  razorpayPaymentId: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Orders
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage customer orders
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Order header */}
                  <div
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        #{order.id.slice(0, 8)} &middot;{" "}
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{parseFloat(order.total).toFixed(2)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          statusColors[order.status] || ""
                        }`}
                      >
                        {order.status}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedId === order.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === order.id && (
                    <div className="border-t border-gray-200 p-5 dark:border-gray-700">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                            Customer
                          </h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.customerName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerEmail}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                            Delivery
                          </h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {order.address}
                            {order.city && `, ${order.city}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                            Payment
                          </h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {order.razorpayPaymentId === "cash_on_delivery"
                              ? "Cash on Delivery — collect payment on delivery"
                              : order.razorpayPaymentId
                                ? `Razorpay payment ID: ${order.razorpayPaymentId}`
                                : "Not paid yet"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                            Update Status
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((status) => (
                              <button
                                key={status}
                                onClick={() => updateStatus(order.id, status)}
                                disabled={updatingId === order.id || order.status === status}
                                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                                  order.status === status
                                    ? "bg-gray-200 text-gray-500 cursor-default dark:bg-gray-700 dark:text-gray-400"
                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                } disabled:opacity-50`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
