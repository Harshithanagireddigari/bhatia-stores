"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft, Eye } from "lucide-react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    removeItem(item.productId);
    toast.success(`Moved "${item.name}" to your shopping cart!`);
  };

  const handleRemove = (item: any) => {
    removeItem(item.productId);
    toast.info(`Removed "${item.name}" from wishlist.`);
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Saved Collections
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              My Wishlist ({items.length} item{items.length > 1 ? "s" : ""})
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all items from wishlist?")) {
                  clearWishlist();
                  toast.info("Wishlist cleared.");
                }
              }}
              className="text-xs font-semibold text-stone-500 hover:text-red-600 transition"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        {items.length === 0 ? (
          <div className="mt-16 text-center rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 max-w-lg mx-auto dark:border-stone-800 dark:bg-stone-900/60">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <Heart size={32} />
            </div>
            <h2 className="mt-5 font-serif text-xl font-bold text-stone-900 dark:text-white">
              Your Wishlist is Empty
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              Save your favourite large-format slabs, floor tiles, and sanitaryware fixtures to easily review or move them to cart later.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white hover:bg-purple-900 transition"
            >
              <span>Explore Tile Collections</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all hover:border-amber-600/30 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.productId}`}
                  className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 block"
                >
                  <img
                    src={item.image || "/products/new-stock/pgvt-01.jpg"}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-3.5 py-1 text-xs font-semibold text-stone-900 backdrop-blur-md">
                      <Eye size={12} /> View Product
                    </span>
                  </div>
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <Link href={`/product/${item.productId}`} className="flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold text-stone-900 hover:text-purple-900 transition dark:text-white">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="mt-2 font-serif text-lg font-bold text-stone-900 dark:text-white">
                    ₹{item.price.toFixed(2)}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
                    >
                      <ShoppingCart size={14} />
                      <span>Move to Cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="p-2.5 text-stone-400 hover:text-red-600 rounded-xl border border-stone-200 hover:bg-stone-50 transition dark:border-stone-700 dark:hover:bg-stone-800"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
