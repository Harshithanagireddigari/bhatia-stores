"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Tag, Truck, AlertCircle, Loader2, Lock } from "lucide-react";
import { getProductMeasurements } from "@/lib/product-spec";

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

type AvailableCoupon = {
  id: string;
  title: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: string | number;
};

type LocationData = {
  pincode: string;
  city: string;
  district?: string;
  state: string;
  postOffice: string;
  deliveryAvailable: boolean;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [storeControls, setStoreControls] = useState<{ prepaidEnabled?: boolean; codEnabled?: boolean; codLimit?: string }>({
    prepaidEnabled: true,
    codEnabled: true,
    codLimit: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
  });

  // Pincode & Delivery status
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Coupon state
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    title: string;
    discountType: "percent" | "flat";
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Check auth, store settings, active coupons & load Razorpay script
  useEffect(() => {
    async function initCheckout() {
      try {
        // 1. Check authentication status
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            setIsAuthenticated(true);
            setUser(authData.user);
            setForm((prev) => ({
              ...prev,
              name: authData.user.name || "",
              email: authData.user.email || "",
              phone: authData.user.phone || "",
            }));
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }

        // 2. Fetch active coupons
        fetch("/api/coupons")
          .then((r) => r.ok ? r.json() : [])
          .then((data) => {
            if (Array.isArray(data)) setAvailableCoupons(data);
          })
          .catch(() => {});

        // 3. Fetch store settings (for COD limits / payment toggles)
        fetch("/api/admin/settings")
          .then((r) => r.ok ? r.json() : {})
          .then((settings: Record<string, any>) => {
            const storeObj = settings.store || settings;
            if (storeObj) {
              setStoreControls(storeObj);
              if (storeObj.prepaidEnabled === false && storeObj.codEnabled !== false) {
                setPaymentMethod("cod");
              }
            }
          })
          .catch(() => {});

      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setCheckingAuth(false);
      }
    }

    initCheckout();

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Recalculate discount whenever total or applied coupon changes
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? (total * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const finalDiscount = Math.min(total, Math.max(0, discountAmount));
  const finalTotal = Math.max(0, total - finalDiscount);

  // Phone Validation helper
  const validatePhone = (phoneStr: string): boolean => {
    const cleaned = phoneStr.replace(/\s/g, "");
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  // Pincode lookup
  async function handlePincodeChange(pincodeVal: string) {
    setForm((prev) => ({ ...prev, pincode: pincodeVal }));
    const cleaned = pincodeVal.trim();
    if (cleaned.length === 6 && /^\d{6}$/.test(cleaned)) {
      setPincodeLoading(true);
      setPincodeError(null);
      try {
        const res = await fetch(`/api/pincode/${cleaned}`);
        const data = await res.json();
        if (res.ok && data.deliveryAvailable !== undefined) {
          setLocationData(data);
          setForm((prev) => ({
            ...prev,
            city: data.city || prev.city,
            state: data.state || prev.state,
          }));
        } else {
          setPincodeError(data.error || "Pincode not found");
          setLocationData(null);
        }
      } catch {
        setPincodeError("Could not verify pincode");
        setLocationData(null);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setLocationData(null);
      if (cleaned.length > 0 && cleaned.length !== 6) {
        setPincodeError("Pincode must be 6 digits");
      } else {
        setPincodeError(null);
      }
    }
  }

  // Apply Coupon
  async function applyCouponCode(codeToApply?: string) {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        const discVal = Number(data.discountValue);
        const calcDisc = data.discountType === "percent" ? (total * discVal) / 100 : discVal;
        setAppliedCoupon({
          code: data.code,
          title: data.title,
          discountType: data.discountType,
          discountValue: discVal,
          discountAmount: Math.min(total, calcDisc),
        });
        setCouponCodeInput(data.code);
        toast.success(`Coupon "${data.code}" applied successfully!`);
      }
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    toast.info("Coupon removed");
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

    if (!validatePhone(form.phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number (+91 optional, starting with 6-9)");
      return;
    }

    if (locationData && !locationData.deliveryAvailable) {
      toast.error("Delivery is currently unavailable for this pincode. Please try another address.");
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
            customerName: form.name,
            customerEmail: form.email,
            address: `${form.address}${form.pincode ? `, Pincode: ${form.pincode}` : ""}`,
            city: form.city,
            phone: form.phone,
            paymentMethod: "cod",
            couponCode: appliedCoupon?.code,
          }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");
        clearCart();
        toast.success("Cash on Delivery order placed successfully!");
        router.push("/orders");
        return;
      }

      // Create Razorpay payment intent
      const rpRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          couponCode: appliedCoupon?.code,
        }),
      });

      if (!rpRes.ok) {
        const errData = await rpRes.json();
        throw new Error(errData.error || "Payment initialization failed");
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
              address: `${form.address}${form.pincode ? `, Pincode: ${form.pincode}` : ""}`,
              city: form.city,
              phone: form.phone,
              paymentMethod: "razorpay",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon?.code,
            }),
          });

          if (orderRes.ok) {
            clearCart();
            toast.success("Order placed successfully!");
            router.push("/orders");
          } else {
            const errData = await orderRes.json();
            toast.error(errData.error || "Order creation failed. Please contact support.");
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

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-stone-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Preparing secure checkout…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Lock size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Sign In to Continue Checkout</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Please sign in or create an account to save your delivery address and access your order history.
          </p>
          <button
            onClick={() => router.push(`/login?redirect=${encodeURIComponent("/checkout")}`)}
            className="mt-6 w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            Sign In to Checkout
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Your cart is empty.</p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-4 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const codLimitNum = Number(storeControls.codLimit);
  const isCodExceeded = Number.isFinite(codLimitNum) && codLimitNum > 0 && finalTotal > codLimitNum;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete your order with secure delivery & payment
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Lock size={14} /> 256-bit Encrypted Checkout
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 md:col-span-3">
          {/* Customer info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">1. Contact Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="John Doe"
                  readOnly={!!user?.name}
                />
              </div>
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
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="john@example.com"
                  readOnly={!!user?.email}
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
                  pattern="^(\+91[\s-]?)?[6-9]\d{9}$"
                  title="Enter valid 10-digit Indian phone number"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="+91 9876543210"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: 10-digit Indian mobile number
                </p>
              </div>
            </div>
          </div>

          {/* Address & Pincode Detection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" /> 2. Delivery Address
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pincode *
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    placeholder="e.g. 400001 or 560001"
                  />
                  {pincodeLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600">
                      <Loader2 className="animate-spin" size={18} />
                    </div>
                  )}
                </div>

                {/* Pincode Status feedback */}
                {locationData && (
                  <div className={`mt-2 flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${locationData.deliveryAvailable ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"}`}>
                    {locationData.deliveryAvailable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <div>
                      <p>
                        {locationData.deliveryAvailable
                          ? `✓ Delivery available to ${locationData.postOffice || locationData.city}, ${locationData.district || ""}, ${locationData.state}`
                          : `✕ Delivery currently unavailable for ${locationData.pincode}`}
                      </p>
                    </div>
                  </div>
                )}
                {pincodeError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={13} /> {pincodeError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Street Address *
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="House/Flat No., Building, Street Name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City / District
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">3. Payment Method</h2>
            <div className="mt-4 space-y-3">
              {storeControls.prepaidEnabled !== false && (
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${paymentMethod === "razorpay" ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Prepaid — Online Payment</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cards, UPI, NetBanking, Razorpay Wallet</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Instant</span>
                </label>
              )}

              {storeControls.codEnabled !== false && (
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${paymentMethod === "cod" ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20" : "border-gray-200 dark:border-gray-700"} ${isCodExceeded ? "opacity-60 cursor-not-allowed" : ""}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      disabled={isCodExceeded}
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isCodExceeded
                          ? `Unavailable for orders over ₹${storeControls.codLimit}`
                          : "Pay cash upon arrival"}
                      </p>
                    </div>
                  </div>
                  <Truck size={18} className="text-gray-400" />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (locationData !== null && !locationData.deliveryAvailable)}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing order..." : `Place Order — ₹${finalTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Right Panel: Order Summary & Active Coupons */}
        <div className="space-y-6 md:col-span-2">
          {/* Coupon Code Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Tag size={18} className="text-amber-500" /> Coupons & Offers
            </h3>

            {appliedCoupon ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                      {appliedCoupon.code}
                    </span>
                    <p className="mt-1 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      {appliedCoupon.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Saving ₹{appliedCoupon.discountAmount.toFixed(2)} on this order!
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm uppercase text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => applyCouponCode()}
                    disabled={validatingCoupon}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {validatingCoupon ? "Validating..." : "Apply"}
                  </button>
                </div>

                {/* Available active offer badges */}
                {availableCoupons.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Available Deals:</p>
                    <div className="mt-2 space-y-2">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          onClick={() => applyCouponCode(coupon.code)}
                          className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-2.5 transition hover:bg-indigo-100/60 dark:border-indigo-800 dark:bg-indigo-950/30"
                        >
                          <div>
                            <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              {coupon.code}
                            </span>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{coupon.title}</p>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Apply →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
            <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-2 text-sm">
                  <div className="max-w-[70%]">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                    {(() => {
                      const specs = getProductMeasurements(item.name);
                      return <p className="text-[11px] font-semibold text-[#b49663]">Dimensions: {specs.shortDimensions}</p>;
                    })()}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</p>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{finalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total Payable</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
