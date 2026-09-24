"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  status: string;
  total: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  phone: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view order details.");
          } else if (res.status === 404) {
            setError("Order not found.");
          } else {
            setError("Failed to load order.");
          }
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">{error}</p>
        <Link href="/orders" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = order.status === "cancelled" ? -1 : statusSteps.indexOf(order.status);
  const isCashOnDelivery = order.razorpayPaymentId === "cash_on_delivery";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-sm">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          ₹{parseFloat(order.total).toFixed(2)}
        </span>
      </div>

      {/* Tracking */}
      {order.status !== "cancelled" && (
        <div className="mt-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tracking Status</h2>
          <div className="mt-3 flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i <= currentStep
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span
                    className={`mt-1 text-[11px] capitalize ${
                      i <= currentStep
                        ? "font-medium text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`mx-1.5 h-0.5 flex-1 ${
                      i < currentStep
                        ? "bg-indigo-600"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400">
            This order has been cancelled.
          </p>
        </div>
      )}

      {/* Items */}
      <div className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Items Ordered</h2>
        <div className="mt-2 space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {item.productName}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Delivery Address</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-white">{order.customerName}</span>
            <br />
            {order.address}
            {order.city && <>, {order.city}</>}
            <br />
            <span className="text-gray-500">{order.phone}</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payment</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {isCashOnDelivery ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">Cash on Delivery</span>
                <br />
                Pay ₹{parseFloat(order.total).toFixed(2)} upon delivery
              </>
            ) : order.razorpayPaymentId ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">Paid via Razorpay</span>
                <br />
                ID: {order.razorpayPaymentId}
              </>
            ) : (
              "Payment pending"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
