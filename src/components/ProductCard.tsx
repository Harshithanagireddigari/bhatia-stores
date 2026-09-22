"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext"; // Assuming a hook exists for wishlist actions

export type Product = {
  id: string;
  name: string;
  price: string; // formatted price string, e.g. "₹199"
  image: string; // URL or relative path
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
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900">
          <Image src={product.image} alt={product.name} fill className="object-cover transition duration-300 hover:scale-105" />
        </div>
        <h3 className="mt-3 text-base font-medium text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-[#4f46e5] dark:text-indigo-300">₹{Number(product.price).toLocaleString("en-IN")}</p>
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1 rounded-full bg-[#4f46e5] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-2"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
        <button
          onClick={() => toggleItem({ productId: product.id, name: product.name, price: parseFloat(product.price.replace(/[^0-9.]/g, "")), image: product.image, quantity: 1 })}
          aria-label={hasItem(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          className="rounded-full p-1 text-gray-600 hover:text-[#4f46e5] dark:text-gray-300 dark:hover:text-indigo-300"
        >
          <Heart size={16} fill={hasItem(product.id) ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
