"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import ImageViewerModal from "@/components/ImageViewerModal";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import {
  Heart,
  ShoppingCart,
  Zap,
  MessageCircle,
  Maximize2,
  Star,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  dimensions?: string;
  finish?: string;
  material?: string;
  rating?: string;
  featured?: number;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setSelectedImageIndex(0);

          // Fetch related products in the same category
          const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.category)}`);
          if (relRes.ok) {
            const relData = await relRes.json();
            if (Array.isArray(relData)) {
              setRelatedProducts(relData.filter((p: Product) => p.id !== data.id).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-stone-200 dark:bg-stone-800" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded-lg bg-stone-200 dark:bg-stone-800" />
              <div className="h-6 w-1/4 rounded-lg bg-stone-200 dark:bg-stone-800" />
              <div className="h-24 rounded-lg bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Product Not Found</h2>
        <p className="mt-2 text-sm text-stone-500">The product you are looking for may have been updated or removed from the catalog.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const numPrice = parseFloat(product.price);
  const inWishlist = hasItem(product.id);
  const isAvailable = product.stock > 0;
  const ratingNum = product.rating ? parseFloat(product.rating) : 4.8;

  const imageList: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || "/products/new-stock/pgvt-01.jpg"];

  const currentMainImage = imageList[selectedImageIndex] || imageList[0];

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error("This product is currently out of stock.");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      image: currentMainImage,
      quantity,
    });
    toast.success(`Added ${quantity} box(es) of "${product.name}" to cart`);
  };

  const handleBuyNow = () => {
    if (!isAvailable) {
      toast.error("This product is currently out of stock.");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      image: currentMainImage,
      quantity,
    });
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      image: currentMainImage,
      quantity: 1,
    });
  };

  const handleWhatsAppEnquiry = () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const msg = `Hello Bhatia Stores, I am interested in purchasing:\n• Product: ${product.name}\n• Category: ${product.category}\n• Price: ₹${numPrice.toFixed(2)}\n• Quantity Required: ${quantity} box(es)\n• Link: ${pageUrl}\nCould you please share stock availability and freight estimation?`;
    window.open(`https://wa.me/919984979720?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-8">
          <Link href="/" className="hover:text-stone-900 dark:hover:text-white transition">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-stone-900 dark:hover:text-white transition">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-stone-900 dark:hover:text-white transition">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-stone-900 dark:text-white truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: Gallery & Zoomable Viewer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Image Stage */}
            <div className="group relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-md dark:border-stone-800 dark:bg-stone-900">
              <img
                src={currentMainImage}
                alt={product.name}
                className="h-full w-full object-cover object-center cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                onClick={() => setIsViewerOpen(true)}
              />

              {/* Click to Enlarge Badge */}
              <button
                type="button"
                onClick={() => setIsViewerOpen(true)}
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-stone-900 hover:scale-105"
              >
                <Maximize2 size={13} />
                <span>Full Screen & Zoom</span>
              </button>

              {/* Category Badge */}
              <span className="absolute left-4 top-4 rounded-full bg-stone-900/80 px-3 py-1 text-xs font-medium tracking-wide text-amber-300 backdrop-blur-md">
                {product.category}
              </span>
            </div>

            {/* Thumbnail Filmstrip */}
            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-amber-600 scale-102 shadow-md ring-2 ring-amber-600/20"
                        : "border-stone-200 opacity-70 hover:opacity-100 dark:border-stone-800"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                {product.category}
              </span>
              <h1 className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating and Stock Status */}
              <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Star size={14} className="fill-current" />
                  <span className="font-bold">{ratingNum.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">(Verified Batch)</span>
                </div>
                <span>•</span>
                <div>
                  {isAvailable ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ In Stock ({product.stock} boxes available)
                    </span>
                  ) : (
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ✕ Currently Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                  ₹{numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  / Box (Incl. of all taxes)
                </span>
              </div>
              <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                ⚡ Eligible for Free Regional Freight on orders over ₹5,000
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Product Overview
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector & Action Buttons */}
            {isAvailable && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Quantity (Boxes):
                  </span>
                  <div className="flex items-center rounded-xl border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-base font-bold text-stone-700 hover:bg-stone-100 transition rounded-l-xl dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] text-center font-bold text-sm text-stone-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3.5 py-1.5 text-base font-bold text-stone-700 hover:bg-stone-100 transition rounded-r-xl dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-900 transition active:scale-98 dark:bg-stone-800 dark:hover:bg-purple-800"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-amber-500 transition active:scale-98"
                  >
                    <Zap size={16} />
                    <span>Buy Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                      inWishlist
                        ? "border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                    }`}
                  >
                    <Heart size={15} className={inWishlist ? "fill-amber-600 text-amber-600" : ""} />
                    <span>{inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppEnquiry}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Quote</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Guarantees */}
            <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-4 space-y-2.5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
              <div className="flex items-center gap-2.5">
                <Truck size={15} className="text-amber-600" />
                <span>Regional Freight Delivery in 2–4 Business Days</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-amber-600" />
                <span>100% Inspected Genuine Material & Anti-Crack Packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Table */}
        <div className="mt-16 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            <Layers size={14} />
            <span>Technical Specifications</span>
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold text-stone-900 dark:text-white">
            Material Details & Dimensional Parameters
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 border-t border-stone-100 pt-6 dark:border-stone-800 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Dimensions</span>
              <span className="font-semibold text-stone-900 dark:text-white">{product.dimensions || "600 x 600 mm"}</span>
            </div>

            <div className="flex justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Surface Finish</span>
              <span className="font-semibold text-stone-900 dark:text-white">{product.finish || "High Gloss Glazed"}</span>
            </div>

            <div className="flex justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Body Material</span>
              <span className="font-semibold text-stone-900 dark:text-white">{product.material || "Vitrified Porcelain Body"}</span>
            </div>

            <div className="flex justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Water Absorption</span>
              <span className="font-semibold text-stone-900 dark:text-white">&lt; 0.05% (Vitrified Standard)</span>
            </div>

            <div className="flex justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Edge Alignment</span>
              <span className="font-semibold text-stone-900 dark:text-white">Rectified Laser-Cut</span>
            </div>

            <div className="flex justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Recommended Applications</span>
              <span className="font-semibold text-stone-900 dark:text-white">Living Rooms, Baths, Commercial</span>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Recommended Surfaces
                </span>
                <h3 className="mt-1 font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Related Products in {product.category}
                </h3>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-semibold text-purple-900 hover:text-amber-700 dark:text-amber-400 transition"
              >
                View Category →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Interactive Zoomable Modal Viewer */}
      <ImageViewerModal
        images={imageList}
        initialIndex={selectedImageIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        productName={product.name}
      />
    </div>
  );
}
