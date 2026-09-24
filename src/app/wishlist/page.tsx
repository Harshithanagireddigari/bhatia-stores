"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-6xl">
        
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
          >
            <ArrowLeft size={16} className="text-[#b49663]" />
            <span>← Go Back</span>
          </button>

          <Link href="/shop" className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline">
            Explore All Products
          </Link>
        </div>

        {/* Header Hero Card */}
        <div className="rounded-[28px] border border-[#e2d5c3] bg-white p-8 sm:p-10 text-center shadow-lg dark:border-[#382f25] dark:bg-[#1a1613] mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b49663] dark:text-[#c5a059]">
            YOUR FAVORITES
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
            Saved Wishlist ({items.length})
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs text-stone-600 dark:text-stone-300">
            Save tiles, sanitaryware, and luxury hardware designs you want to compare or discuss.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
            <p className="text-sm text-stone-500 dark:text-stone-400">Your wishlist is currently empty.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#c5a059] px-6 py-3 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663]"
            >
              <ShoppingBag size={16} />
              <span>Browse Luxury Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.productId}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <Link href={`/product/${item.productId}`} className="block">
                  <div className="relative h-44 overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-950">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="mt-4 font-bold text-stone-900 dark:text-white line-clamp-2 text-sm">
                    {item.name}
                  </h2>
                  <p className="mt-1 font-bold text-[#b49663] dark:text-[#c5a059] text-sm">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                </Link>
                <div className="mt-5 flex items-center gap-3 text-xs">
                  <button
                    onClick={() => addItem({ ...item, quantity: 1 })}
                    className="flex-1 rounded-2xl bg-[#c5a059] py-2.5 font-bold text-stone-900 shadow hover:bg-[#b49663] transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="rounded-2xl border border-stone-300 p-2.5 text-stone-600 hover:text-red-600 dark:border-stone-700 dark:text-stone-400 dark:hover:text-red-400 transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
