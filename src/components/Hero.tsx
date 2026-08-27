"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  Star,
  Layers,
  Bath,
  Droplets,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { toast } from "sonner";

interface SlideItem {
  id: string;
  label: string;
  category: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  copy: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  highlights: Array<{
    id: string;
    name: string;
    price: number;
    priceFormatted: string;
    rating: number;
    image: string;
  }>;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: "pgvt",
    label: "PGVT Glazed Slabs",
    category: "Vitrified Floor Tiles",
    eyebrow: "The 2026 Surface Edit",
    headline: "Architectural Grandeur in",
    headlineAccent: "Every Living Space.",
    copy: "Large-format 600x1200 mm PGVT vitrified porcelain slabs featuring Italian Statuario, Calacatta Gold, and Nero Marquina veins. Nano-polished, scratch-proof, and designed for timeless elegance.",
    image: "/products/new-stock/pgvt-01.jpg",
    ctaText: "Explore Collection",
    ctaLink: "/shop?category=Vitrified+Floor+Tiles",
    highlights: [
      {
        id: "hero-pgvt-1",
        name: "PGVT Calacatta Gold Slab",
        price: 1350,
        priceFormatted: "₹1,350/box",
        rating: 4.9,
        image: "/products/new-stock/pgvt-01.jpg",
      },
      {
        id: "hero-pgvt-2",
        name: "Statuario Venato Slab",
        price: 1420,
        priceFormatted: "₹1,420/box",
        rating: 4.9,
        image: "/products/new-stock/pgvt-02.jpg",
      },
    ],
  },
  {
    id: "double-charge",
    label: "Double Charge Vitrified",
    category: "Double Charge",
    eyebrow: "High-Traffic Strength",
    headline: "Engineered for Enduring",
    headlineAccent: "Strength & Mirror Shine.",
    copy: "Heavy-duty 600x600 mm double-charge vitrified flooring. 4mm wear layer engineered to withstand commercial foot traffic, resistance to heavy wear, and anti-bacterial zero-porosity finish.",
    image: "/products/new-stock/gnam-dc-01.jpg",
    ctaText: "View Double Charge Tiles",
    ctaLink: "/shop?category=Double+Charge",
    highlights: [
      {
        id: "hero-dc-1",
        name: "SunCore Matrix Opal DC",
        price: 1650,
        priceFormatted: "₹1,650/box",
        rating: 4.9,
        image: "/products/new-stock/gnam-dc-01.jpg",
      },
      {
        id: "hero-dc-2",
        name: "Crystal Beige DC Tile",
        price: 1680,
        priceFormatted: "₹1,680/box",
        rating: 4.8,
        image: "/products/new-stock/gnam-dc-02.jpg",
      },
    ],
  },
  {
    id: "sanitaryware",
    label: "Italian Sanitaryware",
    category: "Sanitaryware & Faucets",
    eyebrow: "Luxury Bath Edit",
    headline: "Sculpted Ceramics &",
    headlineAccent: "Designer Brassware.",
    copy: "Transform master bathrooms into private spa sanctuaries with Italian rimless wall-hung WC suites, countertop vessel wash basins, and PVD brushed gold brassware faucets.",
    image: "/products/catalog/hindware-01.jpg",
    ctaText: "Explore Sanitaryware",
    ctaLink: "/shop?category=Sanitaryware+%26+Faucets",
    highlights: [
      {
        id: "hero-san-1",
        name: "Hindware Rimless Wall WC",
        price: 8990,
        priceFormatted: "₹8,990",
        rating: 4.9,
        image: "/products/catalog/hindware-01.jpg",
      },
      {
        id: "hero-san-2",
        name: "Brushed Gold Tall Basin Mixer",
        price: 4200,
        priceFormatted: "₹4,200",
        rating: 4.9,
        image: "/products/catalog/hindware-07.jpg",
      },
    ],
  },
];

const ROTATE_INTERVAL = 7000;

export default function Hero() {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  // Load custom launchpad slides if configured
  useEffect(() => {
    fetch("/api/launchpad")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.slides) && data.slides.length > 0) {
          const activeDbSlides = data.slides.filter((s: any) => s.active === 1);
          if (activeDbSlides.length > 0) {
            const mapped: SlideItem[] = activeDbSlides.map((s: any, idx: number) => ({
              id: s.id,
              label: s.title,
              category: "Tiles & Sanitaryware",
              eyebrow: s.eyebrow || "The 2026 Surface Edit",
              headline: s.title,
              headlineAccent: "",
              copy: s.subtitle,
              image: s.image,
              ctaText: s.ctaText || "Explore Products",
              ctaLink: s.ctaLink || "/shop",
              highlights: DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].highlights,
            }));
            setSlides(mapped);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Slide rotation logic
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, ROTATE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, slides.length]);

  const currentSlide = slides[activeIndex] || DEFAULT_SLIDES[0];

  const handleAddToCart = (item: any) => {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success(`Added "${item.name}" to cart`);
  };

  const handleToggleWishlist = (item: any) => {
    toggleItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  };

  return (
    <section
      className="relative min-h-[660px] lg:min-h-[720px] w-full overflow-hidden bg-stone-950 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Smooth Crossfade Animation */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.headline}
              fill
              className="object-cover object-center"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Sophisticated Dark Gradient Overlays for Luxury Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/92 via-stone-950/70 to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
      </div>

      {/* Main Hero Content Area */}
      <div className="relative z-10 mx-auto flex min-h-[660px] lg:min-h-[720px] max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:py-16">
        {/* Top spacer */}
        <div />

        {/* Center Hero Copy & CTAs */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-300 backdrop-blur-md">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>{currentSlide.eyebrow}</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-3xl leading-[1.12] sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                  {currentSlide.headline}{" "}
                  {currentSlide.headlineAccent && (
                    <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent">
                      {currentSlide.headlineAccent}
                    </span>
                  )}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-sm sm:text-base leading-relaxed text-stone-300/90 max-w-xl">
                  {currentSlide.copy}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={currentSlide.ctaLink}
                className="group flex items-center gap-2 rounded-full bg-amber-600 px-7 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl transition-all hover:bg-amber-500 hover:shadow-amber-600/30 active:scale-95"
              >
                <span>{currentSlide.ctaText}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://wa.me/919984979720?text=Hello%20Bhatia%20Stores,%20I%20would%20like%20a%20quote%20and%20catalogue%20for%20tiles%20and%20sanitaryware."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <MessageCircle size={16} className="text-emerald-400" />
                <span>WhatsApp Enquiry / Quote</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-white/10 pt-6 text-xs text-stone-300">
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-amber-400" /> Fast Regional Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-400" /> 100% Quality Inspected
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" /> 4.9 Showroom Rating
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={14} className="text-amber-400" /> Direct WhatsApp Support
              </span>
            </div>
          </div>

          {/* Floating Product Highlight Cards (Right side) */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                <div className="rounded-2xl border border-white/15 bg-stone-900/65 p-4 backdrop-blur-xl shadow-2xl">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Showroom Highlights
                    </span>
                    <span className="text-[11px] text-stone-400">Direct Delivery</span>
                  </div>

                  <div className="space-y-3">
                    {currentSlide.highlights.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-2.5 transition hover:bg-white/10"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-800">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium text-white">{item.name}</p>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-300">
                            <Star size={11} className="fill-current" />
                            <span>{item.rating}</span>
                            <span className="text-stone-400 font-normal">| {item.priceFormatted}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-white/10 hover:text-amber-400"
                            aria-label="Wishlist"
                          >
                            <Heart size={14} className={hasItem(item.id) ? "fill-amber-400 text-amber-400" : ""} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-amber-600"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Slide Switcher Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <span className="text-xs font-medium text-stone-400 mr-2 uppercase tracking-wider">
            Explore:
          </span>
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeIndex === idx
                  ? "bg-amber-500 text-stone-950 font-semibold shadow-md"
                  : "bg-white/5 text-stone-300 hover:bg-white/15"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
