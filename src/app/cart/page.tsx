"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { getProductMeasurements } from "@/lib/product-spec";

function isProductImage(image: string) {
  return image.startsWith("/") || image.startsWith("http") || image.startsWith("data:image/");
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Browse our products and add items to your cart.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
          >
            <span className="text-[#b49663]">←</span>
            <span>Continue Shopping</span>
          </Link>

          <Link href="/account" className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
            My Account
          </Link>
        </div>

        {/* Hero Header */}
        <div className="rounded-[28px] border border-[#e2d5c3] bg-white p-8 shadow-lg dark:border-[#382f25] dark:bg-[#1a1613] mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              {itemCount} item{itemCount > 1 ? "s" : ""} selected for checkout
            </p>
          </div>
        </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-3xl dark:bg-gray-700">
              {isProductImage(item.image) ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                item.image
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {item.name}
              </h3>
              {(() => {
                const specs = getProductMeasurements(item.name);
                return (
                  <p className="text-xs font-semibold text-[#b49663] mt-0.5">
                    Dimensions: {specs.shortDimensions} {specs.coverage ? `• ${specs.coverage}` : ""}
                  </p>
                );
              })()}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ₹{item.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center rounded-full border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                −
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-medium text-gray-900 dark:text-white">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right font-semibold text-gray-900 dark:text-white">
              ₹{(item.price * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(item.productId)}
              className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              aria-label="Remove"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between text-lg">
          <span className="text-gray-600 dark:text-gray-300">Total</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{total.toFixed(2)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-full bg-indigo-600 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  </div>
);
}
