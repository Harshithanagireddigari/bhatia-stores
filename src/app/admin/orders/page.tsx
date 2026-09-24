"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  shiprocketOrderId?: string | null;
  shiprocketShipmentId?: string | null;
  shiprocketAwbCode?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pushingShiprocketId, setPushingShiprocketId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh orders every 5 seconds for real-time automatic updates
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function fetchOrders(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch {
      // ignore
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);

    // Optimistic UI Update: update state instantly so badge changes immediately on screen
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`Order #${orderId.slice(0, 8).toUpperCase()} updated to ${newStatus.toUpperCase()}`);
      fetchOrders(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
      fetchOrders(true);
    } finally {
      setUpdatingId(null);
    }
  }

  async function pushToShiprocket(orderId: string) {
    setPushingShiprocketId(orderId);
    try {
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to push to Shiprocket");

      toast.success(`🚀 Order #${orderId.slice(0, 8).toUpperCase()} dispatched via Shiprocket! ID: ${data.shiprocketOrderId}`);
      fetchOrders(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Shiprocket dispatch error");
    } finally {
      setPushingShiprocketId(null);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold",
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Manage Orders
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Real-time live customer orders and fulfillment status management.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Auto-Sync Active
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-3xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">No orders received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition dark:border-gray-800 dark:bg-gray-800"
                >
                  {/* Order header bar */}
                  <div
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-4 p-6 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-base">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()} &middot;{" "}
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                        ₹{parseFloat(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`rounded-full px-3.5 py-1 text-xs capitalize transition-all duration-300 ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                          expandedId === order.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === order.id && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 dark:border-gray-700/80 dark:bg-gray-900/40">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            CUSTOMER
                          </h4>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{order.customerEmail}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            DELIVERY
                          </h4>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {order.address}
                            {order.city && `, ${order.city}`}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{order.phone}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            PAYMENT
                          </h4>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {order.razorpayPaymentId === "cash_on_delivery"
                              ? "Cash on Delivery — collect payment on delivery"
                              : order.razorpayPaymentId
                              ? `Online Prepaid (ID: ${order.razorpayPaymentId})`
                              : "Not paid yet"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#b49663] dark:text-[#c5a059] flex items-center gap-1.5">
                            <span>SHIPROCKET LOGISTICS & SHIPPING</span>
                          </h4>
                          {order.shiprocketOrderId ? (
                            <div className="mt-1 rounded-2xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900/40 dark:bg-purple-950/20 text-xs space-y-1">
                              <p className="font-bold text-purple-900 dark:text-purple-300">
                                Shiprocket ID: <span className="font-mono">{order.shiprocketOrderId}</span>
                              </p>
                              {order.shiprocketAwbCode && (
                                <p className="text-purple-800 dark:text-purple-400">
                                  AWB Code: <span className="font-mono font-semibold">{order.shiprocketAwbCode}</span>
                                </p>
                              )}
                              {order.courierName && (
                                <p className="text-purple-700 dark:text-purple-400">
                                  Courier Partner: <span className="font-semibold">{order.courierName}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                onClick={() => pushToShiprocket(order.id)}
                                disabled={pushingShiprocketId === order.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                              >
                                {pushingShiprocketId === order.id ? (
                                  <Loader2 className="animate-spin" size={13} />
                                ) : (
                                  <span>🚀 Dispatch via Shiprocket</span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            UPDATE STATUS (AUTO-UPDATES INSTANTLY)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((status) => {
                              const isCurrent = order.status === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => updateStatus(order.id, status)}
                                  disabled={updatingId === order.id || isCurrent}
                                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                                    isCurrent
                                      ? "bg-[#b49663] text-white shadow-sm opacity-100 cursor-default"
                                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                  } disabled:opacity-50 flex items-center gap-1.5`}
                                >
                                  {updatingId === order.id && isCurrent && (
                                    <Loader2 className="animate-spin" size={12} />
                                  )}
                                  <span>{status}</span>
                                </button>
                              );
                            })}
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
