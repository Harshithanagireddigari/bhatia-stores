"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  Banknote,
  MessageCircle,
  ArrowLeft,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: string;
  subtotal?: string;
  shippingFee?: string;
  discount?: string;
  customerName: string;
  customerEmail: string;
  address: string;
  locality?: string;
  city: string;
  state?: string;
  pincode?: string;
  phone: string;
  paymentMethod: string;
  razorpayPaymentId: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Packed & Crated" },
  { key: "shipped", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get("new") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (res.status === 401) setError("Please sign in to view this order.");
          else if (res.status === 404) setError("Order not found.");
          else setError("Failed to retrieve order details.");
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Network connection issue. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel order");
      setOrder(data);
      toast.success("Order has been cancelled.");
    } catch (err: any) {
      toast.error(err.message || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const openWhatsAppSupport = () => {
    if (!order) return;
    const shortId = order.id.slice(0, 8).toUpperCase();
    const msg = `Hello Bhatia Stores, I have a query regarding Order #${shortId} placed under ${order.customerName}. Could you please assist me?`;
    window.open(`https://wa.me/919984979720?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 mx-auto rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="h-64 rounded-2xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <AlertCircle size={40} className="mx-auto text-amber-700" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-white">{error || "Order Not Found"}</h2>
          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
          >
            <ArrowLeft size={14} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const currentStepIndex = order.status === "cancelled" ? -1 : ORDER_STEPS.findIndex((s) => s.key === order.status);
  const stepNumber = currentStepIndex >= 0 ? currentStepIndex : 1; // default to confirmed if status matches
  const isPrepaid = order.paymentMethod !== "cod";

  const fullAddress = [order.address, order.locality, order.city, order.state, order.pincode].filter(Boolean).join(", ");

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Breadcrumb / Back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-purple-900 dark:text-stone-400 dark:hover:text-white transition"
          >
            <ArrowLeft size={14} />
            <span>Back to All Orders</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* New Order Congratulations Banner */}
        {isNewOrder && (
          <div className="mb-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950 dark:text-white">
                  Thank You for Your Order, {order.customerName}!
                </h3>
                <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Your order <strong>#{shortId}</strong> has been registered. An automatic confirmation receipt was dispatched to <strong>{order.customerEmail}</strong> and WhatsApp notification was sent to <strong>{order.phone}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Header Card */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 dark:border-stone-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Order Tracking & Dispatch
              </span>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                Order #{shortId}
              </h1>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-500 dark:text-stone-400">Total Amount</span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-purple-900 dark:text-amber-400">
                ₹{parseFloat(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300 mt-1">
                {isPrepaid ? "Prepaid (Online)" : "Cash on Delivery"}
              </span>
            </div>
          </div>

          {/* Live Progress Stepper */}
          {order.status !== "cancelled" ? (
            <div className="py-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-6">
                Live Dispatch Timeline
              </h3>

              <div className="relative flex items-center justify-between">
                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= stepNumber;
                  const isCurrent = idx === stepNumber;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-purple-900 text-white shadow-md ring-4 ring-purple-100 dark:ring-purple-950"
                            : "bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                      </div>

                      <span
                        className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                          isCurrent
                            ? "text-purple-900 dark:text-amber-400 font-bold"
                            : isCompleted
                            ? "text-stone-900 dark:text-white"
                            : "text-stone-400 dark:text-stone-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}

                {/* Stepper Progress Bar */}
                <div className="absolute left-8 right-8 top-5 -z-0 h-0.5 bg-stone-200 dark:bg-stone-800">
                  <div
                    className="h-full bg-purple-900 transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, stepNumber) / (ORDER_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-6 rounded-xl bg-purple-50 p-3 text-xs text-purple-950 dark:bg-purple-950/40 dark:text-purple-300">
                  <strong>Freight Tracking Consignment No:</strong> {order.trackingNumber}
                </div>
              )}
            </div>
          ) : (
            <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              This order was cancelled. If you made an online payment, a full refund will be processed to your original payment method.
            </div>
          )}

          {/* Action Links: WhatsApp Support & Cancel Order */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6 dark:border-stone-800">
            <button
              type="button"
              onClick={openWhatsAppSupport}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              <MessageCircle size={15} />
              <span>Get Dispatch Updates on WhatsApp</span>
            </button>

            {(order.status === "pending" || order.status === "confirmed") && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left: Ordered Materials (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4 dark:border-stone-800">
                Ordered Tiles & Sanitaryware ({order.items.length})
              </h3>

              <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-stone-200/60 dark:bg-stone-800 dark:border-stone-700">
                        <img
                          src={item.productImage || "/products/new-stock/pgvt-01.jpg"}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-semibold text-xs sm:text-sm text-stone-900 hover:text-purple-900 dark:text-white truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                          Qty: <strong>{item.quantity} box(es)</strong> • ₹{Number(item.price).toFixed(2)}/box
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-sm text-stone-900 dark:text-white">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Shipping Destination & Payment Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Destination */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                <MapPin size={14} />
                <span>Delivery Address</span>
              </div>
              <p className="mt-3 text-sm font-bold text-stone-900 dark:text-white">
                {order.customerName}
              </p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {fullAddress}
              </p>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Contact: <strong>{order.phone}</strong>
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-4">
                Payment Summary
              </h4>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 dark:text-white">
                    ₹{Number(order.subtotal || order.total).toFixed(2)}
                  </span>
                </div>

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied</span>
                    <span>-₹{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Regional Freight</span>
                  <span className="font-semibold">
                    {Number(order.shippingFee) === 0 ? "FREE" : `₹${Number(order.shippingFee).toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-base text-stone-900 dark:border-stone-800 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-lg text-purple-900 dark:text-amber-400">
                    ₹{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500 dark:border-stone-800">
                Payment Mode: <strong className="text-stone-900 dark:text-white">{isPrepaid ? "Prepaid (Online)" : "Cash on Delivery"}</strong>
                {order.razorpayPaymentId && order.razorpayPaymentId !== "CASH_ON_DELIVERY" && (
                  <p className="mt-0.5 text-[11px] font-mono text-stone-400">Ref: {order.razorpayPaymentId}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
