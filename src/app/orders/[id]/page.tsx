"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { RotateCcw, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
}

interface ReturnRequest {
  id: string;
  productId: string;
  requestType: "return" | "exchange";
  reason: string;
  details: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  adminComment: string | null;
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
  shiprocketOrderId?: string | null;
  shiprocketAwbCode?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  deliveredAt?: string | null;
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
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [requestType, setRequestType] = useState<"return" | "exchange">("return");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState("");
  const [returnErrorMsg, setReturnErrorMsg] = useState("");

  const fetchOrderData = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        if (res.status === 401) setError("Please log in to view order details.");
        else if (res.status === 404) setError("Order not found.");
        else setError("Failed to load order.");
        return;
      }
      const data = await res.json();
      setOrder(data);

      // Fetch return requests
      const returnsRes = await fetch(`/api/orders/${id}/return`);
      if (returnsRes.ok) {
        const retData = await returnsRes.json();
        setReturnRequests(retData);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !reason) return;
    setSubmittingReturn(true);
    setReturnErrorMsg("");
    setReturnSuccessMsg("");

    try {
      const res = await fetch(`/api/orders/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          requestType,
          reason,
          details,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setReturnSuccessMsg(json.message || "Request submitted successfully!");
        setSelectedProduct(null);
        setReason("");
        setDetails("");
        await fetchOrderData();
      } else {
        setReturnErrorMsg(json.error || "Failed to submit request.");
      }
    } catch {
      setReturnErrorMsg("Network error occurred.");
    } finally {
      setSubmittingReturn(false);
    }
  };

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
        <Link href="/orders" className="mt-4 inline-block text-indigo-600 hover:underline font-bold">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = order.status === "cancelled" ? -1 : statusSteps.indexOf(order.status);
  const isCashOnDelivery = order.razorpayPaymentId === "cash_on_delivery";

  // Calculate 14 day return eligibility
  const deliveryTime = order.deliveredAt
    ? new Date(order.deliveredAt).getTime()
    : order.status === "delivered"
    ? new Date(order.createdAt).getTime()
    : null;

  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const isDelivered = order.status === "delivered";
  const daysPassed = deliveryTime ? Math.floor((now - deliveryTime) / (1000 * 60 * 60 * 24)) : 0;
  const isReturnEligible = isDelivered && deliveryTime !== null && (now - deliveryTime) <= fourteenDaysMs;
  const daysRemaining = 14 - daysPassed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-sm font-sans">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
        >
          <span className="text-[#b49663]">←</span>
          <span>Back to My Orders</span>
        </Link>

        <Link href="/account" className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
          My Account Dashboard
        </Link>
      </div>

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

      {/* 14-Day Return / Exchange Alert Banner */}
      {isDelivered && (
        <div
          className={`mt-4 rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isReturnEligible
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <RotateCcw
              className={`h-5 w-5 mt-0.5 ${
                isReturnEligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            />
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                14-Day Return & Exchange Policy
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                {isReturnEligible
                  ? `Delivered on ${new Date(deliveryTime!).toLocaleDateString("en-IN")}. You have ${daysRemaining} day${
                      daysRemaining === 1 ? "" : "s"
                    } left to return or exchange items.`
                  : "Exchange time is expired. The 14-day window following delivery has passed."}
              </p>
            </div>
          </div>
        </div>
      )}

      {returnSuccessMsg && (
        <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {returnSuccessMsg}
        </div>
      )}

      {returnErrorMsg && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {returnErrorMsg}
        </div>
      )}

      {/* Shiprocket Delivery Badge & Live Tracking Card */}
      {order.shiprocketAwbCode && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:border-purple-900/50 dark:from-purple-950/30 dark:to-indigo-950/30 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  SHIPROCKET LOGISTICS COURIER
                </span>
                <span className="rounded-full bg-purple-200 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  DISPATCHED
                </span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-stone-900 dark:text-white">
                Courier Partner: <span className="text-purple-700 dark:text-purple-300">{order.courierName || "Shiprocket Express"}</span>
              </p>
              <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400 font-mono">
                AWB Tracking Code: <span className="font-bold text-stone-900 dark:text-white">{order.shiprocketAwbCode}</span>
              </p>
            </div>
            <a
              href={order.trackingUrl || `https://shiprocket.co/tracking/${order.shiprocketAwbCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-700 transition"
            >
              <span>Track Live Package 🚚</span>
            </a>
          </div>
        </div>
      )}

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

      {/* Items */}
      <div className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Items Ordered</h2>
        <div className="mt-2 space-y-3">
          {order.items.map((item) => {
            const existingReq = returnRequests.find((r) => r.productId === item.productId);

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                  </p>

                  {existingReq && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <Clock className="h-3 w-3" />
                      <span>
                        {existingReq.requestType.toUpperCase()} ({existingReq.status.toUpperCase()})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>

                  {isDelivered && isReturnEligible && !existingReq && (
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Return / Exchange
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return/Exchange Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-indigo-600" />
                Request Return or Exchange
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Product
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedProduct.productName}
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Request Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType("return")}
                    className={`py-2 rounded-lg font-bold transition border ${
                      requestType === "return"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    Return Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType("exchange")}
                    className={`py-2 rounded-lg font-bold transition border ${
                      requestType === "exchange"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    Exchange Item
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for {requestType} *
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select a reason --</option>
                  <option value="Damaged or defective item">Damaged or defective item</option>
                  <option value="Wrong size or dimension">Wrong size or dimension</option>
                  <option value="Different finish/color received">Different finish/color received</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Additional Details / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide any specific details or replacement preferences..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn || !reason}
                  className="px-5 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition"
                >
                  {submittingReturn ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
