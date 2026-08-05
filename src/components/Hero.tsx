"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Fraunces, Inter } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bath,
  ChevronDown,
  Droplets,
  Heart,
  LayoutGrid,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  User,
} from "lucide-react";

// Font setup – using the newly added Inter (body) and Poppins (display) fonts.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const ROTATE_MS = 6000;

const CATEGORIES = [
  {
    id: "marble",
    label: "Marble Look",
    count: "Tile Collection",
    icon: LayoutGrid,
    image: "/products/catalog/bhatia-catalogue-02.jpg",
    eyebrow: "The 2026 Tile Edit",
    headlineTop: "Crafting Beautiful Homes,",
    headlineAccent: "one tile at a time.",
    copy: "Marble-look porcelain, handcrafted mosaics, and large-format slabs — laid by our own tiling crews, not a subcontractor.",
    highlights: [
      { name: "Luca White Marble", price: "₹89/sq.ft", rating: 4.8 },
      { name: "Matrix Galaxy", price: "₹72/sq.ft", rating: 4.7 },
    ],
  },
  {
    id: "contemporary",
    label: "Modern Tiles",
    count: "Tile Collection",
    icon: Bath,
    image: "/products/catalog/bhatia-catalogue-05.jpg",
    eyebrow: "The 2026 Tile Edit",
    headlineTop: "Give Every Room",
    headlineAccent: "a signature surface.",
    copy: "Discover contemporary tile designs with durable finishes, made for kitchens, living spaces, and bathrooms.",
    highlights: [
      { name: "Wall-Hung Basin", price: "₹6,499", rating: 4.9 },
      { name: "Rimless WC Suite", price: "₹11,299", rating: 4.8 },
    ],
  },
  {
    id: "statement",
    label: "Statement Walls",
    count: "Tile Collection",
    icon: Droplets,
    image: "/products/catalog/gnam-wall-06.jpg",
    eyebrow: "The 2026 Wall Tile Edit",
    headlineTop: "Make Your Walls",
    headlineAccent: "the centre of attention.",
    copy: "Brass-bodied faucets in brushed gold, matte black, and polished chrome — built to outlast the renovation around them.",
    highlights: [
      { name: "Brushed Gold Faucet", price: "₹3,999", rating: 4.9 },
      { name: "Matte Black Mixer", price: "₹4,499", rating: 4.7 },
    ],
  },
] as const;

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < Math.round(rating) ? "fill-primary-500 text-primary-500" : "text-neutral-300"}
        />
      ))}
    </div>
  );
}

import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Cart & Wishlist actions for floating product cards
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      quantity: 1,
    });
  };

  const handleToggleWishlist = (product: any) => {
    toggleItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      quantity: 1,
    });
  };

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = CATEGORIES[activeIndex];

  useEffect(() => setMounted(true), []);

  const startRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setHasInteracted(true);
      setActiveIndex((i) => (i + 1) % CATEGORIES.length);
    }, ROTATE_MS);
  };

  const pauseRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectCategory(index: number) {
    setHasInteracted(true);
    setActiveIndex(index);
    startRotation();
  }

  return (
    <section
      className={`${fraunces.variable} ${inter.variable} relative h-screen min-h-[760px] w-full overflow-hidden bg-neutral-dark font-[var(--font-body)]`}
    >
      {/* Rotating background image */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1 },
              scale: { duration: ROTATE_MS / 1000 + 1, ease: "linear" },
            }}
            className="absolute inset-0"
          >
            <Image src={active.image} alt={active.label} fill className="object-cover object-center" priority={activeIndex === 0 && !hasInteracted} />
          </motion.div>
        </AnimatePresence>
        {/* Dark overlay with subtle primary tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-dark/90 via-neutral-dark/60 to-neutral-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/70 via-transparent to-neutral-dark/10" />
      </div>

      {/* Glass‑style header replaces previous navbar */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={mounted ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="absolute inset-x-0 top-6 z-30 mx-auto flex w-[94%] max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 backdrop-blur-xl"
      >
        <span className="font-[var(--font-display)] text-lg tracking-[0.18em] text-white">BHATIA</span>
        <nav className="hidden items-center gap-6 text-sm text-white lg:flex">
          <a href="#collections" className="rounded-sm transition hover:text-primary">Collections</a>
          <a href="#new-arrivals" className="rounded-sm transition hover:text-primary">New Arrivals</a>
          <a href="#brands" className="rounded-sm transition hover:text-primary">Brands</a>
          <a href="#offers" className="rounded-sm transition hover:text-primary">Offers</a>
          <a href="#contact" className="rounded-sm transition hover:text-primary">Contact</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#wishlist" aria-label="Wishlist" className="rounded-full p-2 text-white transition hover:bg-white/10 hover:text-primary">
            <Heart size={18} />
          </a>
          <a href="#cart" aria-label="Cart" className="relative rounded-full p-2 text-white transition hover:bg-white/10 hover:text-primary">
            <ShoppingCart size={18} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-neutral-dark">
              0
            </span>
          </a>
          <a href="#login" aria-label="Login" className="hidden rounded-full p-2 text-white transition hover:bg-white/10 hover:text-primary sm:inline-flex">
            <User size={18} />
          </a>
          <a
            href="https://wa.me/919120435950"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-[#062910] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </motion.header>

      {/* Hero copy */}
      <div className="relative z-20 flex h-full max-w-2xl flex-col justify-center gap-5 px-6 md:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-primary">{active.eyebrow}</span>
            </div>
            <h1 className="font-[var(--font-display)] text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl">
              {active.headlineTop}<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{active.headlineAccent}</span>
            </h1>
            <p className="max-w-md text-base text-neutral-300 md:text-lg">{active.copy}</p>
          </motion.div>
        </AnimatePresence>
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={mounted ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center gap-4"
        >
          <motion.a
            href="#collections"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E8CD8B] px-7 py-3 text-sm font-semibold text-[#1A1508] shadow-[0_8px_30px_-8px_rgba(201,162,75,0.6)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Explore Collection
            <span aria-hidden>→</span>
          </motion.a>
          <motion.a
            href="https://wa.me/919120435950"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-7 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <MessageCircle size={16} /> Get Quote on WhatsApp
          </motion.a>
        </motion.div>
        {/* Trust badges */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={mounted ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap items-center gap-5 pt-1 text-xs text-neutral-300"
        >
          <span className="flex items-center gap-1.5"><Star size={13} className="fill-primary text-primary" /> 4.9 Rating</span>
          <span className="flex items-center gap-1.5"><Truck size={14} /> Fast Delivery</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure Checkout</span>
          <span className="flex items-center gap-1.5"><MessageCircle size={14} /> WhatsApp Support</span>
        </motion.div>
      </div>

      {/* Floating product cards */}
      <div className="absolute right-8 top-28 z-20 hidden gap-4 lg:flex">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4"
          >
            {active.highlights.map((product, i) => (
              <motion.div
                key={product.name}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                className="w-[168px] rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <active.icon size={16} className="text-primary" />
                  <button type="button" aria-label={`Add ${product.name} to wishlist`} onClick={() => handleToggleWishlist(product)} className="rounded-full p-1 text-neutral-300 transition hover:bg-white/10 hover:text-primary">
                    <Heart size={13} />
                  </button>
                </div>
                <p className="mt-2 text-xs font-medium leading-tight text-white">{product.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <RatingStars rating={product.rating} />
                  <span className="text-[10px] text-neutral-400">{product.rating}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-[var(--font-display)] text-sm text-primary">{product.price}</span>
                  <button type="button" aria-label={`Add ${product.name} to cart`} className="rounded-full bg-white/10 p-1.5 text-white transition hover:bg-primary hover:text-neutral-dark">
                    <ShoppingCart size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Category selector */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={mounted ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        onMouseEnter={pauseRotation}
        onMouseLeave={startRotation}
        onFocus={pauseRotation}
        onBlur={startRotation}
        className="absolute bottom-8 right-6 z-20 w-[min(90vw,340px)] rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl md:bottom-12 md:right-16"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Shop by Category</p>
        <div className="mt-3 flex gap-2">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const isActive = active.id === category.id;
            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => handleSelectCategory(index)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={isActive}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-neutral-300"} />
                <span className="text-[11px] leading-tight text-white">{category.label}</span>
                <span className="text-[9px] text-neutral-400">{category.count}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500 xl:flex"
      >
        <span>Scroll to Explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
