"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { toast } from "sonner";
import ProductImageZoom from "@/components/ProductImageZoom";
import ProductReviewsSection from "@/components/ProductReviewsSection";
import ProductCard from "@/components/ProductCard";
import { getProductMeasurements } from "@/lib/product-spec";
import { Ruler, PackageCheck } from "lucide-react";

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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
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
    async function fetchProductData() {
      try {
        const [res, allRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/products`),
        ]);

        if (res.ok) {
          const data = await res.json();
          setProduct(data);

          if (allRes.ok) {
            const allData: Product[] = await allRes.json();
            const filtered = allData.filter((p) => p.id !== id);
            // Sort to prioritize same category
            filtered.sort((a, b) => (a.category === data.category ? -1 : 1));
            setRelatedProducts(filtered.slice(0, 4));
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
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
    <div className="mx-auto max-w-6xl px-4 py-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
        >
          <span className="text-[#b49663]">←</span>
          <span>Go Back</span>
        </button>

        <Link
          href="/shop"
          className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline"
        >
          All Products & Catalog
        </Link>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Product image */}
        <div className="overflow-visible rounded-2xl bg-stone-100 p-2 dark:bg-stone-800">
          {isProductImage(product.image) ? (
            <ProductImageZoom
              src={product.image}
              alt={product.name}
              galleryImages={[product.image]}
            />
          ) : (
            <div className="flex min-h-[24rem] items-center justify-center">
              <span className="text-[120px]">{product.image}</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b49663]">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-stone-900 dark:text-white">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-stone-900 dark:text-white">
            ₹{parseFloat(product.price).toFixed(2)}
          </p>

          {/* Product Measurements & Specifications Box */}
          {(() => {
            const specs = getProductMeasurements(product.name, product.category);
            return (
              <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <Ruler className="text-[#b49663] shrink-0 mt-0.5" size={20} />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-stone-900 dark:text-white">
                      Dimensions: <span className="font-semibold text-stone-700 dark:text-stone-300">{specs.dimensions}</span>
                    </p>
                    {specs.coverage && (
                      <p className="text-stone-600 dark:text-stone-400">
                        Coverage: <span className="font-semibold text-stone-700 dark:text-stone-300">{specs.coverage}</span>
                      </p>
                    )}
                    <p className="text-stone-600 dark:text-stone-400">
                      Material: <span className="font-semibold text-stone-700 dark:text-stone-300">{specs.material}</span> • Finish: <span className="font-semibold text-stone-700 dark:text-stone-300">{specs.finish}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          <p className="mt-5 leading-relaxed text-stone-700 dark:text-stone-300">
            {product.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-3.5 py-1 text-xs font-semibold ${
                product.stock > 0
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-stone-300 dark:border-stone-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-lg font-semibold text-stone-700 dark:text-stone-200"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-bold text-stone-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3.5 py-2 text-lg font-semibold text-stone-700 dark:text-stone-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  addProductToCart();
                  toast.success(`Added ${quantity} to cart!`);
                }}
                className="rounded-full bg-[#b49663] px-8 py-3.5 font-bold text-white shadow-md transition hover:bg-[#967b4b]"
              >
                Add to Cart
              </button>

              <button
                onClick={() =>
                  toggleItem({
                    productId: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image,
                    quantity: 1,
                  })
                }
                className="rounded-full border border-rose-400 px-5 py-3.5 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                {hasItem(product.id) ? "♥ Saved" : "♡ Add to Wishlist"}
              </button>

              <button
                onClick={() => {
                  addProductToCart();
                  router.push("/checkout");
                }}
                className="rounded-full border border-[#b49663] px-8 py-3.5 font-bold text-[#b49663] transition hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                Buy Now
              </button>

              <button
                onClick={chatOnWhatsApp}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
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

      {/* Related / Similar Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-stone-200 pt-12 dark:border-stone-800 font-sans">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b49663]">
                DISCOVER MORE
              </p>
              <h2 className="mt-1 font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">
                More Products Like This
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] hover:underline"
            >
              View All Catalog →
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ProductReviewsSection productId={product.id} />
    </div>
  );
}
