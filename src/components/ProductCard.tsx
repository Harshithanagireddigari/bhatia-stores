"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import ProductQuickViewModal from "./ProductQuickViewModal";

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  stock?: number;
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <>
      <div className="group flex min-w-0 flex-col rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900 sm:rounded-2xl sm:p-4 font-sans">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-950">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 48vw, (max-width: 1023px) 33vw, 25vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
            />
          </Link>

          {/* Quick View Floating Action */}
          <button
            onClick={() => setQuickViewId(product.id)}
            className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-stone-900 shadow-md backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-[#b49663] hover:text-white dark:bg-stone-900/95 dark:text-white md:flex"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="mt-2.5 text-xs font-bold leading-4 text-stone-900 transition-colors duration-300 group-hover:text-[#b49663] dark:text-white dark:group-hover:text-[#c5a059] sm:mt-3 sm:text-sm sm:leading-normal">
            {product.name}
          </h3>
          <p className="mt-1 text-xs font-bold text-[#b49663] dark:text-[#c5a059] sm:text-sm">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
        </Link>

        <div className="mt-2.5 flex items-center justify-between sm:mt-3">
          <button
            onClick={handleAddToCart}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#b49663] px-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#967b4b] focus:outline-none sm:h-auto sm:rounded-full sm:px-3.5 sm:py-1.5"
          >
            <ShoppingCart size={13} />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
          <button
            onClick={() =>
              toggleItem({
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price.replace(/[^0-9.]/g, "")),
                image: product.image,
                quantity: 1,
              })
            }
            aria-label={hasItem(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            className={`rounded-lg p-1.5 transition sm:rounded-full ${
              hasItem(product.id)
                ? "text-red-500 dark:text-red-400"
                : "text-stone-400 hover:text-[#b49663] dark:text-stone-500 dark:hover:text-[#c5a059]"
            }`}
          >
            <Heart size={16} fill={hasItem(product.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {quickViewId && (
        <ProductQuickViewModal
          productId={quickViewId}
          onClose={() => setQuickViewId(null)}
        />
      )}
    </>
  );
}
