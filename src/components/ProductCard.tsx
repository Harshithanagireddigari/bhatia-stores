"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { toast } from "sonner";

export interface ProductItem {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  image: string;
  images?: string[];
  category?: string;
  stock?: number;
  dimensions?: string | null;
  finish?: string | null;
  material?: string | null;
  rating?: string | number | null;
  featured?: number | boolean;
}

interface ProductCardProps {
  product: ProductItem;
  priority?: boolean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const numPrice = typeof product.price === "number" ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, "") || "0");
  const inWishlist = hasItem(product.id);
  const ratingNum = product.rating ? parseFloat(String(product.rating)) : 4.8;
  const isAvailable = product.stock === undefined || product.stock > 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock < 15;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) {
      toast.error("This product is currently out of stock.");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      image: product.image,
      quantity: 1,
    });
    toast.success(`Added "${product.name}" to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-700/30 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900">
      {/* Image Container with Badges */}
      <Link href={`/product/${product.id}`} className="relative block aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={product.image || "/products/new-stock/pgvt-01.jpg"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            inWishlist
              ? "bg-amber-600 text-white shadow-md"
              : "bg-white/85 text-stone-700 hover:bg-white hover:text-amber-700 dark:bg-stone-900/80 dark:text-stone-300"
          }`}
        >
          <Heart size={17} className={inWishlist ? "fill-current" : ""} />
        </button>

        {/* Category Tag Badge */}
        {product.category && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-stone-900/75 px-2.5 py-1 text-[11px] font-medium tracking-wide text-amber-200/90 backdrop-blur-md">
            {product.category}
          </span>
        )}

        {/* Stock Status Badge */}
        <div className="absolute bottom-2.5 left-3 z-10">
          {!isAvailable ? (
            <span className="rounded-md bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="rounded-md bg-amber-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-stone-900 shadow-lg backdrop-blur-md dark:bg-stone-900/90 dark:text-white">
            <Eye size={13} /> View Details
          </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Dimensions & Finish subtitle */}
        {(product.dimensions || product.finish) && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {[product.dimensions, product.finish].filter(Boolean).join(" • ")}
          </p>
        )}

        {/* Title */}
        <Link href={`/product/${product.id}`} className="mt-1 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-stone-900 transition-colors hover:text-amber-800 sm:text-base dark:text-stone-100 dark:hover:text-amber-400">
            {product.name}
          </h3>
        </Link>

        {/* Rating and Price */}
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Star size={13} className="fill-current" />
              <span className="font-semibold">{ratingNum.toFixed(1)}</span>
            </div>
            <p className="mt-0.5 text-lg font-bold tracking-tight text-stone-900 dark:text-white">
              ₹{numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-purple-900 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 dark:bg-stone-800 dark:hover:bg-purple-800 dark:disabled:bg-stone-800"
          >
            <ShoppingCart size={15} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
