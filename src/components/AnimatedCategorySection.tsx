"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export type CategoryDisplayItem = {
  id: string;
  name: string;
  subtitle: string;
  slug: string;
  image: string;
};

const defaultFallbacks: Record<string, string> = {
  "floor-tiles": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  "wall-tiles": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
  "bathroom-tiles": "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop",
  "sanitaryware": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
  "faucets-taps": "https://images.unsplash.com/photo-1585758925574-d4bfa55eb5db?q=80&w=800&auto=format&fit=crop",
  "wash-basins": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
  "toilets-wc": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
  "bathroom-accessories": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
};

export default function AnimatedCategorySection({
  categories,
}: {
  categories: CategoryDisplayItem[];
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 35, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 240,
        damping: 22,
      },
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 overflow-hidden">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#b49663]/30 bg-[#f7f3ec] px-4 py-1.5 text-xs font-bold uppercase tracking-[.25em] text-[#a08b68] dark:bg-stone-800 dark:text-[#d4af37]">
          <Sparkles size={13} className="text-[#b49663]" /> Curated Collections
        </div>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#2c241d] sm:text-4xl md:text-5xl dark:text-white">
          Explore By Category
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
          Discover luxury tiles, sanitaryware, fittings, and architectural finishes designed for modern living.
        </p>
        <div className="mx-auto mt-4 h-0.5 w-16 bg-[#b49663]" />
      </motion.div>

      {/* Grid with Framer Motion Stagger & Spring Hover */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {categories.map((cat) => {
          const validImage =
            cat.image && cat.image.trim().length > 0 && !cat.image.includes("broken")
              ? cat.image
              : defaultFallbacks[cat.slug] || defaultFallbacks["floor-tiles"];

          return (
            <motion.div
              key={cat.id}
              variants={cardVariants}
              whileHover={{
                y: -10,
                transition: { type: "spring", stiffness: 350, damping: 20 },
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#b49663] hover:shadow-xl dark:border-stone-800 dark:bg-stone-900"
            >
              <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} className="block">
                {/* Image Frame with Motion Zoom */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                  <motion.img
                    src={validImage}
                    alt={cat.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        defaultFallbacks[cat.slug] || defaultFallbacks["floor-tiles"];
                    }}
                    whileHover={{ scale: 1.12 }}
                    transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                    View Collection →
                  </span>
                </div>

                {/* Card Meta */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base font-bold text-[#2c241d] group-hover:text-[#b49663] dark:text-white transition-colors duration-200 truncate">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                  <motion.span
                    whileHover={{ x: 5, scale: 1.1 }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-all duration-300 group-hover:border-[#b49663] group-hover:bg-[#b49663] group-hover:text-white dark:border-stone-700"
                  >
                    <ArrowRight size={15} />
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
