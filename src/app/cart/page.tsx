"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total: subtotal, itemCount } = useCart();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent?: number; flat?: number } | null>(null);

  // Free shipping threshold = ₹5,000
  const freeShippingThreshold = 5000;
  const standardShippingFee = 299;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;

  // Coupon calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.percent) {
      discountAmount = (subtotal * appliedCoupon.percent) / 100;
    } else if (appliedCoupon.flat) {
      discountAmount = Math.min(subtotal, appliedCoupon.flat);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();

    if (clean === "BHATIA10") {
      setAppliedCoupon({ code: "BHATIA10", percent: 10 });
      toast.success("Coupon BHATIA10 applied! 10% discount added.");
    } else if (clean === "LUXURY500") {
      setAppliedCoupon({ code: "LUXURY500", flat: 500 });
      toast.success("Coupon LUXURY500 applied! ₹500 flat discount added.");
    } else if (clean === "WELCOME5") {
      setAppliedCoupon({ code: "WELCOME5", percent: 5 });
      toast.success("Coupon WELCOME5 applied! 5% discount added.");
    } else {
      toast.error("Invalid coupon code. Try BHATIA10 or LUXURY500.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  const handleProceedToCheckout = () => {
    // Save discount info to sessionStorage so checkout can pick it up
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "bhatia_checkout_discount",
        JSON.stringify({
          coupon: appliedCoupon?.code || null,
          discountAmount,
          shippingFee,
        })
      );
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-12 shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <ShoppingBag size={38} />
          </div>
          <h1 className="mt-6 font-serif text-2xl font-bold text-stone-900 dark:text-white">
            Your Cart is Currently Empty
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Explore our curated catalog of vitrified slabs, double charge flooring, wall ceramics, and luxury sanitaryware.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition"
            >
              <span>Explore Tile Collections</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop?category=Sanitaryware+%26+Faucets"
              className="rounded-xl border border-stone-200 py-3 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Browse Italian Sanitaryware
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Your Order
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Shopping Cart ({itemCount} item{itemCount > 1 ? "s" : ""})
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to empty your cart?")) {
                clearCart();
                toast.info("Cart cleared.");
              }
            }}
            className="text-xs font-semibold text-stone-500 hover:text-red-600 transition"
          >
            Clear Entire Cart
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 dark:border-amber-500/20">
          {subtotal >= freeShippingThreshold ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
              <Sparkles size={16} className="text-amber-600" />
              <span>🎉 Congratulations! You have qualified for <strong>FREE Regional Freight Delivery</strong>!</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                <span>Add ₹{(freeShippingThreshold - subtotal).toFixed(2)} more to qualify for <strong>FREE Regional Freight</strong></span>
                <span className="font-bold">{((subtotal / freeShippingThreshold) * 100).toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-amber-200/60 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Cart Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900"
              >
                {/* Item Thumbnail & Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-stone-200/60 dark:bg-stone-800 dark:border-stone-700">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-semibold text-sm sm:text-base text-stone-900 hover:text-purple-900 transition dark:text-white line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      ₹{item.price.toFixed(2)} per box
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-800">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 text-sm font-bold text-stone-700 hover:bg-stone-200 transition rounded-l-xl dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-xs font-bold text-stone-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 text-sm font-bold text-stone-700 hover:bg-stone-200 transition rounded-r-xl dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[5rem]">
                    <span className="text-base font-bold text-stone-900 dark:text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.productId);
                      toast.info(`Removed "${item.name}" from cart`);
                    }}
                    className="p-2 text-stone-400 hover:text-red-600 transition"
                    title="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 hover:text-amber-700 dark:text-amber-400 transition"
              >
                <span>← Continue Shopping & Explore More Tiles</span>
              </Link>
            </div>
          </div>

          {/* Cart Summary & Checkout Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-md dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <div className="mt-5 border-y border-stone-100 py-4 dark:border-stone-800">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span>({appliedCoupon.percent ? `${appliedCoupon.percent}% off` : `₹${appliedCoupon.flat} off`})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Discount code (e.g. BHATIA10)"
                        className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-xs text-stone-900 outline-none uppercase placeholder:normal-case focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition dark:bg-stone-800"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
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
                  <span>Estimated Total</span>
                  <span className="text-xl text-purple-900 dark:text-amber-400">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition active:scale-98 dark:bg-stone-800 dark:hover:bg-purple-800"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              {/* Trust Badges */}
              <div className="mt-6 space-y-2 border-t border-stone-100 pt-4 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                  <span>Prepaid & COD Available on Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-amber-600 shrink-0" />
                  <span>Inspected Freight with Transit Insurance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
