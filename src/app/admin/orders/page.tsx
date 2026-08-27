"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  Send,
  MessageCircle,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: string;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  total: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: any }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-sky-100 dark:bg-sky-950/40",
    text: "text-sky-800 dark:text-sky-300",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    bg: "bg-purple-100 dark:bg-purple-950/40",
    text: "text-purple-800 dark:text-purple-300",
    icon: RefreshCw,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-100 dark:bg-indigo-950/40",
    text: "text-indigo-800 dark:text-indigo-300",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-300",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-300",
    icon: XCircle,
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
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

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    const toastId = toast.loading("Updating order status & notifying customer via Email/WhatsApp...");

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success(`Order #${selectedOrder.id.slice(0, 8)} updated to "${newStatus.toUpperCase()}"!`, {
        id: toastId,
      });

      // Update in local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: newStatus as any, trackingNumber }
            : o
        )
      );

      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus as any, trackingNumber } : null
      );
    } catch (err: any) {
      toast.error(err.message || "Could not update status.", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      o.id.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerEmail?.toLowerCase().includes(q) ||
      o.customerPhone?.includes(q) ||
      o.city?.toLowerCase().includes(q) ||
      o.pincode?.includes(q);

    return matchStatus && matchSearch;
  });

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Fulfillment & Dispatch
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Customer Orders ({orders.length})
            </h1>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 shadow-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, customer name, email, phone, city, pincode..."
              className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? "bg-purple-900 text-white shadow-xs"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">No orders found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400">
                    <th className="py-3.5 px-4 sm:px-6">Order ID & Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Destination</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredOrders.map((order) => {
                    const stBadge = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const StatusIcon = stBadge.icon;

                    return (
                      <tr key={order.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition">
                        <td className="py-3.5 px-4 sm:px-6">
                          <p className="font-mono font-bold text-purple-900 dark:text-amber-400">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-stone-900 dark:text-white">
                            {order.customerName || "Customer"}
                          </p>
                          <p className="text-[11px] text-stone-500">{order.customerPhone || order.customerEmail}</p>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-stone-600 dark:text-stone-300">
                          <p className="font-medium">{order.city || "—"}</p>
                          <p className="text-[11px] text-stone-500">PIN: {order.pincode || "—"}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            {order.paymentMethod === "cod" ? "COD" : "Prepaid"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                          ₹{Number(order.total).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${stBadge.bg} ${stBadge.text}`}
                          >
                            <StatusIcon size={12} />
                            <span>{stBadge.label}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition"
                          >
                            <Eye size={13} />
                            <span>Manage</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-stone-900 dark:border dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Order Management
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Status Update Card */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-3">
                  Update Consignment Status & Tracking
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Current Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white capitalize"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing & Palletizing</option>
                      <option value="shipped">Shipped in Transit</option>
                      <option value="delivered">Delivered to Site</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Tracking / LR Docket Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BHT-EXP-94021"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-900 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-800 transition shadow-sm disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{updating ? "Updating..." : "Save Status & Send Notifications"}</span>
                  </button>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-800/30">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Customer Information
                  </h4>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {selectedOrder.customerName || "N/A"}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    Phone: {selectedOrder.customerPhone || "N/A"}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Email: {selectedOrder.customerEmail || "N/A"}
                  </p>

                  <div className="mt-3">
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hello ${selectedOrder.customerName}, regarding your Bhatia Stores Order #${selectedOrder.id.slice(0, 8)}...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp Customer Directly</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-800/30">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-xs text-stone-800 dark:text-stone-200">
                    {selectedOrder.shippingAddress || "Showroom Pickup"}
                  </p>
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-400 mt-1">
                    {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 font-medium">
                    Payment: {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid"}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-3">
                  Ordered Surfaces ({selectedOrder.items?.length || 0} line items)
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-stone-100 bg-white p-2.5 dark:border-stone-800 dark:bg-stone-900"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage || "/products/new-stock/pgvt-01.jpg"}
                          alt={item.productName}
                          className="h-10 w-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                        />
                        <div>
                          <p className="text-xs font-semibold text-stone-900 dark:text-white">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Quantity: {item.quantity} boxes
                          </p>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between border-t border-stone-100 pt-3 dark:border-stone-800 font-bold text-stone-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-base text-purple-900 dark:text-amber-400">
                    ₹{Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
