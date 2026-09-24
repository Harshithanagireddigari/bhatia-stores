"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

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
    <div className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900 font-sans">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-950">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
          />
        </div>
        <h3 className="mt-3 text-sm font-bold text-stone-900 dark:text-white line-clamp-2 transition-colors duration-300 group-hover:text-[#b49663] dark:group-hover:text-[#c5a059]">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-bold text-[#b49663] dark:text-[#c5a059]">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1.5 rounded-full bg-[#b49663] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#967b4b] focus:outline-none"
        >
          <ShoppingCart size={13} />
          <span>Add to Cart</span>
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
          className={`rounded-full p-1.5 transition ${
            hasItem(product.id)
              ? "text-red-500 dark:text-red-400"
              : "text-stone-400 hover:text-[#b49663] dark:text-stone-500 dark:hover:text-[#c5a059]"
          }`}
        >
          <Heart size={16} fill={hasItem(product.id) ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
