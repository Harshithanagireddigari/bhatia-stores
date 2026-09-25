"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Heart, ShieldCheck, Check, Star, Eye } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

export type FullProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  images?: string[];
  category: string;
  brand?: string;
  finish?: string;
  mountType?: string;
  material?: string;
  warranty?: string;
  stock?: number;
  waterSaving?: number;
  antiRust?: number;
  sensorType?: number;
};

interface Props {
  productId: string | null;
  onClose: () => void;
}

export default function ProductQuickViewModal({ productId, onClose }: Props) {
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setActiveImage(data.image || "");
      })
      .catch((err) => console.error("Failed to load product for quick view:", err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition"
          aria-label="Close Quick View"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#b49663] border-t-transparent" />
          </div>
        ) : !product ? (
          <div className="p-8 text-center text-stone-500">
            <p>Product information unavailable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="bg-stone-50 dark:bg-stone-950 p-6 flex flex-col items-center justify-center">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-800">
                <Image
                  src={activeImage || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center text-[10px] font-bold uppercase tracking-wider">
                {product.waterSaving === 1 && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    💧 Water Saving
                  </span>
                )}
                {product.antiRust === 1 && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    🛡️ Anti-Rust
                  </span>
                )}
                {product.sensorType === 1 && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    ✨ Touchless Sensor
                  </span>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b49663] dark:text-[#c5a059]">
                  {product.category} • {product.brand || "Bhatia Premium"}
                </span>

                <h2 className="mt-1 font-serif text-xl font-bold text-stone-900 dark:text-white line-clamp-2">
                  {product.name}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-[#b49663] dark:text-[#c5a059]">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    In Stock
                  </span>
                </div>

                <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Tech Specs */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-stone-400 block font-medium">Finish</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{product.finish || "Chrome"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Mounting</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{product.mountType || "Wall Mount"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Material</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{product.material || "Brass"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Warranty</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{product.warranty || "10 Years"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#b49663] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[#967b4b] transition"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Shopping Cart</span>
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
                    className={`p-3 rounded-2xl border transition ${
                      hasItem(product.id)
                        ? "border-red-300 bg-red-50 text-red-500 dark:border-red-900/50 dark:bg-red-950/40"
                        : "border-stone-200 dark:border-stone-700 text-stone-500 hover:text-[#b49663]"
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart size={18} fill={hasItem(product.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="block text-center text-xs font-bold text-[#b49663] hover:underline pt-1"
                >
                  View Full Product Details & Reviews →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
