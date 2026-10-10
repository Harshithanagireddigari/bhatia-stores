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
  "floor-tiles": "/products/catalog/suncore-matt-01.jpg",
  "wall-tiles": "/products/catalog/gnam-wall-01.jpg",
  "bathroom-tiles": "/products/catalog/suncore-dc-01.jpg",
  "sanitaryware": "/products/catalog/hindware-01.jpg",
  "faucets-taps": "/products/catalog/hindware-05.jpg",
  "wash-basins": "/products/catalog/hindware-08.jpg",
  "toilets-wc": "/products/catalog/hindware-02.jpg",
  "bathroom-accessories": "/products/catalog/bhatia-catalogue-01.jpg",
};

export default function AnimatedCategorySection({ categories }: { categories: CategoryDisplayItem[] }) {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden px-4 py-8 sm:px-6 md:py-16">
      <div className="category-copy-enter text-left sm:text-center">
        <div className="hidden items-center gap-2 rounded-full border border-[#745624]/40 bg-[#f7f3ec] px-4 py-1.5 text-xs font-bold uppercase tracking-[.25em] text-[#745624] dark:border-[#d4af37]/40 dark:bg-stone-800 dark:text-[#d4af37] sm:inline-flex">
          <Sparkles size={13} className="text-[#745624] dark:text-[#d4af37]" /> Curated Collections
        </div>
        <h2 className="font-serif text-2xl font-medium text-stone-900 sm:mt-3 sm:text-4xl md:text-5xl dark:text-white">Explore By Category</h2>
        <p className="mx-auto mt-2 hidden max-w-xl text-sm text-stone-700 dark:text-stone-300 sm:block">Discover luxury tiles, sanitaryware, fittings, and architectural finishes designed for modern living.</p>
        <div className="mt-3 h-0.5 w-12 bg-[#745624] dark:bg-[#d4af37] sm:mx-auto sm:mt-4 sm:w-16" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {categories.map((category) => {
          const image = category.image?.trim() && !category.image.includes("broken")
            ? category.image
            : defaultFallbacks[category.slug] || defaultFallbacks["floor-tiles"];

          return (
            <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-stone-200/90 bg-white p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#745624] hover:shadow-xl dark:border-stone-800 dark:bg-stone-900 sm:rounded-2xl sm:p-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800 sm:aspect-[4/3] sm:rounded-xl">
                <Image src={image} alt={category.name} fill sizes="(max-width: 639px) 46vw, (max-width: 1023px) 42vw, 22vw" quality={70} className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">View Collection</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-sm font-bold text-stone-900 transition-colors duration-200 group-hover:text-[#745624] dark:text-white dark:group-hover:text-[#d4af37] sm:text-base">{category.name}</h3>
                  <p className="mt-1 hidden text-xs text-stone-600 dark:text-stone-400 sm:line-clamp-1">{category.subtitle}</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition duration-300 group-hover:border-[#745624] group-hover:bg-[#745624] group-hover:text-white dark:border-stone-700 dark:text-stone-300 sm:h-9 sm:w-9"><ArrowRight size={15} /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
