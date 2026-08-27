"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: {
      new (options: any): any;
    };
  }
}

export default function CheckoutPage() {
  const { items, total: subtotal, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("prepaid");
  const [codEnabled, setCodEnabled] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Pincode validation state
  const [pincodeStatus, setPincodeStatus] = useState<{
    checking: boolean;
    valid: boolean;
    deliverable: boolean;
    message: string;
    city?: string;
    state?: string;
  } | null>(null);

  // Discount & Shipping calculation from cart session
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    // 1. Fetch store settings (COD enabled check)
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.cod_enabled === false) {
          setCodEnabled(false);
          setPaymentMethod("prepaid");
        }
        if (subtotal >= (data.free_shipping_threshold || 5000)) {
          setShippingFee(0);
        } else {
          setShippingFee(data.standard_shipping_fee || 299);
        }
      })
      .catch(() => {});

    // 2. Fetch logged in user & saved addresses
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setForm((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          }));
        }
      })
      .catch(() => {});

    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const defaultAddr = data.find((a) => a.isDefault === 1) || data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            applySavedAddress(defaultAddr);
          }
        }
      })
      .catch(() => {});

    // 3. Retrieve coupon discounts from sessionStorage if applied
    if (typeof window !== "undefined") {
      const storedDiscount = sessionStorage.getItem("bhatia_checkout_discount");
      if (storedDiscount) {
        try {
          const parsed = JSON.parse(storedDiscount);
          if (parsed.discountAmount) setDiscountAmount(parsed.discountAmount);
          if (parsed.shippingFee !== undefined) setShippingFee(parsed.shippingFee);
        } catch {
          // ignore
        }
      }
    }

    // 4. Load payment gateway client script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [subtotal]);

  const applySavedAddress = (addr: any) => {
    setForm((prev) => ({
      ...prev,
      name: addr.name || prev.name,
      phone: addr.phone || prev.phone,
      street: addr.street || "",
      apartment: addr.apartment || "",
      locality: addr.locality || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    }));

    if (addr.pincode) {
      validatePincode(addr.pincode);
    }
  };

  const handleAddressSelectChange = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm((prev) => ({
        ...prev,
        street: "",
        apartment: "",
        locality: "",
        city: "",
        state: "",
        pincode: "",
      }));
      setPincodeStatus(null);
    } else {
      const found = savedAddresses.find((a) => a.id === id);
      if (found) {
        applySavedAddress(found);
      }
    }
  };

  const validatePincode = async (code: string) => {
    const clean = code.replace(/\D/g, "");
    if (clean.length !== 6) {
      setPincodeStatus({
        checking: false,
        valid: false,
        deliverable: false,
        message: "Please enter a valid 6-digit Indian pincode.",
      });
      return;
    }

    setPincodeStatus({
      checking: true,
      valid: false,
      deliverable: false,
      message: "Checking delivery availability for your pincode...",
    });

    try {
      const res = await fetch(`/api/pincode?code=${clean}`);
      const data = await res.json();

      if (data.valid && data.deliverable) {
        setPincodeStatus({
          checking: false,
          valid: true,
          deliverable: true,
          message: data.message,
          city: data.city,
          state: data.state,
        });

        // Auto-populate detected city and state if empty
        setForm((prev) => ({
          ...prev,
          city: prev.city || data.city,
          state: prev.state || data.state,
        }));
      } else {
        setPincodeStatus({
          checking: false,
          valid: false,
          deliverable: false,
          message: data.message || "Delivery is currently unavailable to this pincode.",
        });
      }
    } catch {
      setPincodeStatus({
        checking: false,
        valid: false,
        deliverable: false,
        message: "Could not verify pincode availability. Please check your connection.",
      });
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm({ ...form, pincode: val });

    const clean = val.replace(/\D/g, "");
    if (clean.length === 6) {
      validatePincode(clean);
    } else if (clean.length > 0) {
      setPincodeStatus({
        checking: false,
        valid: false,
        deliverable: false,
        message: "Please enter a complete 6-digit pincode.",
      });
    } else {
      setPincodeStatus(null);
    }
  };

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.street || !form.city || !form.pincode) {
      toast.error("Please fill in all required delivery and contact fields.");
      return;
    }

    if (pincodeStatus && !pincodeStatus.deliverable && !pincodeStatus.checking) {
      toast.error("Please enter a valid delivery pincode before completing your checkout.");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cod") {
        // Cash on Delivery Order placement
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            customerName: form.name,
            customerEmail: form.email,
            phone: form.phone,
            address: form.street + (form.apartment ? `, ${form.apartment}` : ""),
            locality: form.locality,
            city: form.city,
            state: form.state || "State",
            pincode: form.pincode,
            paymentMethod: "cod",
            discountAmount,
            shippingAmount: shippingFee,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to place Cash on Delivery order.");
        }

        clearCart();
        toast.success("Cash on Delivery order confirmed!");
        router.push(`/orders/${data.id}?new=true`);
        return;
      }

      // Prepaid (Online) payment flow
      // 1. Initialize intent
      let rpOrderId = `INTENT_${Date.now()}`;
      let rpKeyId = "";

      try {
        const initRes = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          }),
        });
        if (initRes.ok) {
          const initData = await initRes.json();
          rpOrderId = initData.orderId;
          rpKeyId = initData.keyId;
        }
      } catch {
        // Fallback to direct prepaid order
      }

      // If Razorpay SDK modal is available and configured
      if (typeof window !== "undefined" && window.Razorpay && rpKeyId) {
        const options = {
          key: rpKeyId,
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          name: "Bhatia Stores",
          description: "Prepaid Tile & Sanitaryware Order",
          order_id: rpOrderId,
          handler: async function (response: any) {
            const orderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                customerName: form.name,
                customerEmail: form.email,
                phone: form.phone,
                address: form.street + (form.apartment ? `, ${form.apartment}` : ""),
                locality: form.locality,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
                paymentMethod: "prepaid",
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                discountAmount,
                shippingAmount: shippingFee,
              }),
            });

            const ordData = await orderRes.json();
            if (orderRes.ok) {
              clearCart();
              toast.success("Prepaid order confirmed successfully!");
              router.push(`/orders/${ordData.id}?new=true`);
            } else {
              toast.error(ordData.error || "Order placement failed. Please contact support.");
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#6B21A8" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
        return;
      }

      // Standard direct Prepaid order placement (development / direct flow)
      const directRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customerName: form.name,
          customerEmail: form.email,
          phone: form.phone,
          address: form.street + (form.apartment ? `, ${form.apartment}` : ""),
          locality: form.locality,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          paymentMethod: "prepaid",
          razorpayPaymentId: `PREPAID_${Date.now()}`,
          razorpayOrderId: rpOrderId,
          discountAmount,
          shippingAmount: shippingFee,
        }),
      });

      const directData = await directRes.json();
      if (!directRes.ok) {
        throw new Error(directData.error || "Prepaid order placement failed.");
      }

      clearCart();
      toast.success("Prepaid order confirmed successfully!");
      router.push(`/orders/${directData.id}?new=true`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Your Cart is Empty</h2>
          <p className="mt-2 text-sm text-stone-500">Please add tile products to your cart before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white hover:bg-purple-900 transition"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Checkout Header */}
        <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            <Lock size={13} />
            <span>Encrypted 256-Bit Checkout</span>
          </div>
          <h1 className="mt-1.5 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
            Checkout & Delivery Confirmation
          </h1>
        </div>

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handleSubmitOrder} className="mt-8 grid gap-10 lg:grid-cols-12">
          {/* Left Column: Customer & Delivery Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Contact Information */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-900 text-xs font-bold text-white">
                  1
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Customer Information
                </h3>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Ankit Sharma"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">Order confirmation receipt will be sent here.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="+91 98765 43210"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">For dispatch updates and driver coordination.</p>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address with Automatic Pincode Detection */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-900 text-xs font-bold text-white">
                    2
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                    Delivery Destination & Pincode
                  </h3>
                </div>

                {savedAddresses.length > 0 && (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelectChange(e.target.value)}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                  >
                    <option value="new">+ Enter New Address</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.city}, {a.pincode}) {a.isDefault ? "★ Default" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {/* Pincode with Real-Time Detection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Postal Pincode *
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={form.pincode}
                      onChange={handlePincodeChange}
                      required
                      placeholder="e.g. 110001 or 380001"
                      className="w-full max-w-xs rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-semibold tracking-wider text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => validatePincode(form.pincode)}
                      className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                    >
                      Check
                    </button>
                  </div>

                  {/* Pincode Feedback Box */}
                  {pincodeStatus && (
                    <div
                      className={`mt-2 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed ${
                        pincodeStatus.checking
                          ? "bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
                          : pincodeStatus.deliverable
                          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {pincodeStatus.checking ? (
                        <Loader2 size={16} className="mt-0.5 animate-spin text-purple-700 shrink-0" />
                      ) : pincodeStatus.deliverable ? (
                        <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle size={16} className="mt-0.5 text-red-600 shrink-0" />
                      )}
                      <span>{pincodeStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    House / Plot / Street Address *
                  </label>
                  <textarea
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    required
                    rows={2}
                    placeholder="Plot No. 42, Green Valley Enclave, Near City Center..."
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Apartment / Floor / Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.apartment}
                      onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                      placeholder="Tower B, Flat 402"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Locality / Landmark
                    </label>
                    <input
                      type="text"
                      value={form.locality}
                      onChange={(e) => setForm({ ...form, locality: e.target.value })}
                      placeholder="Opposite Metro Station"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      City / District *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                      placeholder="e.g. New Delhi"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      State / Union Territory *
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      required
                      placeholder="e.g. Delhi NCR"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method Selection (Prepaid vs Cash on Delivery) */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-900 text-xs font-bold text-white">
                  3
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Payment Method
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                {/* Prepaid Option */}
                <label
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4.5 transition-all ${
                    paymentMethod === "prepaid"
                      ? "border-purple-900 bg-purple-50/50 dark:border-amber-500 dark:bg-amber-950/20"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "prepaid"}
                    onChange={() => setPaymentMethod("prepaid")}
                    className="mt-1 h-4 w-4 text-purple-900 focus:ring-purple-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900 dark:text-white">
                        Prepaid (Online Payment)
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900 dark:text-amber-400">
                        <CreditCard size={16} />
                        <span>Instant Verified</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Pay securely via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or Net Banking. Faster order processing & express pallet dispatch.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery Option (Only shown if enabled in admin settings!) */}
                {codEnabled && (
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4.5 transition-all ${
                      paymentMethod === "cod"
                        ? "border-purple-900 bg-purple-50/50 dark:border-amber-500 dark:bg-amber-950/20"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 h-4 w-4 text-purple-900 focus:ring-purple-800"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-stone-900 dark:text-white">
                          Cash on Delivery
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                          <Banknote size={16} />
                          <span>Pay upon Unloading</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Pay cash or UPI directly to our delivery logistics partner upon material inspection at your site.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-lg dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                Order Summary ({items.length} product{items.length > 1 ? "s" : ""})
              </h3>

              {/* Itemized list */}
              <div className="mt-5 max-h-60 overflow-y-auto space-y-3.5 pr-1 border-b border-stone-100 pb-5 dark:border-stone-800">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-stone-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-stone-500">Qty: {item.quantity} box(es)</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 dark:text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="mt-5 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Applied</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Regional Freight & Packing</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">Free</span>
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-bold text-stone-900 dark:border-stone-800 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-2xl text-purple-900 dark:text-amber-400">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Confirm & Place Order CTA */}
              <button
                type="submit"
                disabled={loading || (pincodeStatus !== null && !pincodeStatus.deliverable && !pincodeStatus.checking)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-4 text-xs sm:text-sm font-semibold text-white shadow-xl hover:bg-purple-900 transition active:scale-98 disabled:cursor-not-allowed disabled:bg-stone-300 dark:bg-stone-800 dark:hover:bg-purple-800"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm {paymentMethod === "prepaid" ? "Prepaid" : "Cash on Delivery"} Order</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="mt-5 space-y-2 border-t border-stone-100 pt-4 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                  <span>Automatic Email & WhatsApp Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-amber-600 shrink-0" />
                  <span>Doorstep Unloading & Transit Protection</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
