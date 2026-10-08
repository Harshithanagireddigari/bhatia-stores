import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export type CategoryDisplayItem = {
  id: string;
  name: string;
  subtitle: string;
  slug: string;
  image: string;
};

const defaultFallbacks: Record<string, string> = {
  "floor-tiles": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=75&w=800&auto=format&fit=crop",
  "wall-tiles": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=75&w=800&auto=format&fit=crop",
  "bathroom-tiles": "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=75&w=800&auto=format&fit=crop",
  "sanitaryware": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=75&w=800&auto=format&fit=crop",
  "faucets-taps": "https://images.unsplash.com/photo-1585758925574-d4bfa55eb5db?q=75&w=800&auto=format&fit=crop",
  "wash-basins": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=75&w=800&auto=format&fit=crop",
  "toilets-wc": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=75&w=800&auto=format&fit=crop",
  "bathroom-accessories": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=75&w=800&auto=format&fit=crop",
};

export default function AnimatedCategorySection({ categories }: { categories: CategoryDisplayItem[] }) {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden px-4 py-8 sm:px-6 md:py-16">
      <div className="category-copy-enter text-left sm:text-center">
        <div className="hidden items-center gap-2 rounded-full border border-[#b49663]/30 bg-[#f7f3ec] px-4 py-1.5 text-xs font-bold uppercase tracking-[.25em] text-[#a08b68] dark:bg-stone-800 dark:text-[#d4af37] sm:inline-flex">
          <Sparkles size={13} className="text-[#b49663]" /> Curated Collections
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#2c241d] sm:mt-3 sm:text-4xl md:text-5xl dark:text-white">Explore By Category</h2>
        <p className="mx-auto mt-2 hidden max-w-xl text-sm text-stone-600 dark:text-stone-400 sm:block">Discover luxury tiles, sanitaryware, fittings, and architectural finishes designed for modern living.</p>
        <div className="mt-3 h-0.5 w-12 bg-[#b49663] sm:mx-auto sm:mt-4 sm:w-16" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {categories.map((category) => {
          const image = category.image?.trim() && !category.image.includes("broken")
            ? category.image
            : defaultFallbacks[category.slug] || defaultFallbacks["floor-tiles"];

          return (
            <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-stone-200/90 bg-white p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b49663] hover:shadow-xl dark:border-stone-800 dark:bg-stone-900 sm:rounded-2xl sm:p-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800 sm:aspect-[4/3] sm:rounded-xl">
                <Image src={image} alt={category.name} fill sizes="(max-width: 639px) 46vw, (max-width: 1023px) 42vw, 22vw" quality={70} className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">View Collection</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-sm font-bold text-[#2c241d] transition-colors duration-200 group-hover:text-[#b49663] dark:text-white sm:text-base">{category.name}</h3>
                  <p className="mt-1 hidden text-xs text-stone-500 dark:text-stone-400 sm:line-clamp-1">{category.subtitle}</p>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition duration-300 group-hover:border-[#b49663] group-hover:bg-[#b49663] group-hover:text-white dark:border-stone-700 sm:h-9 sm:w-9"><ArrowRight size={15} /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
