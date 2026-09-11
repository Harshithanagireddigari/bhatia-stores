"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Your cart is empty.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cod") {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
            customerName: form.name, customerEmail: form.email, address: form.address,
            city: form.city, phone: form.phone, paymentMethod: "cod",
          }),
        });
        if (!orderRes.ok) throw new Error((await orderRes.json()).error || "Order creation failed");
        clearCart();
        toast.success("Cash on Delivery order placed successfully!");
        router.push("/orders");
        return;
      }

      // Create Razorpay order
      const rpRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })) }),
      });

      if (!rpRes.ok) {
        throw new Error("Payment initialization failed");
      }

      const rpData = await rpRes.json();

      if (!scriptLoaded) {
        throw new Error("Payment gateway is loading. Please try again.");
      }

      const options: RazorpayOptions = {
        key: rpData.keyId,
        amount: rpData.amount,
        currency: rpData.currency || "INR",
        name: "Bhatia Stores",
        description: "Order Payment",
        order_id: rpData.orderId,
        handler: async function (response) {
          // Create the order in our DB
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId,
                productName: i.name,
                quantity: i.quantity,
                price: i.price,
              })),
              customerName: form.name,
              customerEmail: form.email,
              address: form.address,
              city: form.city,
              phone: form.phone,
              paymentMethod: "razorpay",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (orderRes.ok) {
            clearCart();
            toast.success("Order placed successfully!");
            router.push("/orders");
          } else {
            toast.error("Order creation failed. Please contact support.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 md:col-span-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment method *</legend>
            <div className="mt-2 space-y-2 rounded-xl border border-gray-300 p-3 dark:border-gray-600">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name="paymentMethod" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} />
                Prepaid — pay securely online
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name="paymentMethod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                Cash on Delivery
              </label>
            </div>
          </fieldset>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address *
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows={2}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="123, Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Mumbai"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay ₹${total.toFixed(2)} securely`}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Your payment information is encrypted and secure.
          </p>
        </form>

        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
