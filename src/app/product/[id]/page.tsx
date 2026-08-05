"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
}

function isProductImage(image: string) {
  return image.startsWith("/") || image.startsWith("http") || image.startsWith("data:image/");
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  function addProductToCart() {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      quantity,
    });
  }

  function chatOnWhatsApp() {
    if (!product) return;

    const message = `Hi, I would like to know more about ${product.name} (Qty: ${quantity}).`;
    window.open(`https://wa.me/919120435950?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Product not found.</p>
        <Link href="/shop" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
      >
        ← Back to Shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Product image */}
        <div className="flex min-h-[24rem] items-center justify-center overflow-hidden rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
          {isProductImage(product.image) ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[32rem] w-full rounded-xl object-contain"
            />
          ) : (
            <span className="text-[120px]">{product.image}</span>
          )}
        </div>

        {/* Product info */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{parseFloat(product.price).toFixed(2)}
          </p>
          <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">
            {product.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                product.stock > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-lg font-medium text-gray-600 dark:text-gray-300"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-lg font-medium text-gray-600 dark:text-gray-300"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  addProductToCart();
                  toast.success(`Added ${quantity} to cart!`);
                }}
                className="rounded-full bg-primary-600 px-8 py-3 font-semibold text-white transition hover:bg-primary-700"
              >
                Add to Cart
              </button>
              <button onClick={() => toggleItem({ productId: product.id, name: product.name, price: parseFloat(product.price), image: product.image, quantity: 1 })} className="rounded-full border border-rose-400 px-5 py-3 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                {hasItem(product.id) ? "♥ Saved" : "♡ Add to Wishlist"}
              </button>
              <button
                onClick={() => {
                  addProductToCart();
                  router.push("/checkout");
                }}
                className="rounded-full border border-primary-600 px-8 py-3 font-semibold text-primary-600 transition hover:bg-indigo-50 dark:text-primary-400 dark:hover:bg-indigo-950/40"
              >
                Buy Now
              </button>
              <button
                onClick={chatOnWhatsApp}
                className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
                aria-label="Chat about this product on WhatsApp"
              >
                <svg className="h-5 w-5" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                  <path d="M16 3a13 13 0 0 0-11.17 19.64L3 29l6.55-1.72A13 13 0 1 0 16 3Zm0 23.64a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.4A10.64 10.64 0 1 1 16 26.64Zm5.83-7.97c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.71.16-.21.31-.81 1.04-.99 1.25-.18.21-.36.24-.68.08a8.72 8.72 0 0 1-2.57-1.59 9.65 9.65 0 0 1-1.78-2.22c-.19-.32 0-.49.14-.64.15-.15.32-.37.48-.56.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.04 1.29 3.25c.16.21 2.22 3.39 5.37 4.75.75.32 1.33.51 1.79.65.75.24 1.43.21 1.97.13.6-.09 1.9-.78 2.17-1.54.27-.76.27-1.41.19-1.54-.08-.13-.29-.21-.61-.37Z" />
                </svg>
                WhatsApp Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
