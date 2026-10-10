import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq } from "drizzle-orm";
import { ArrowRight, Headphones, ShieldCheck, Tag, Truck } from "lucide-react";
import { db } from "@/db";
import { categories as categoriesTable, heroSlides, products } from "@/db/schema";
import Hero from "@/components/Hero";
import DeferredOffersSection from "@/components/DeferredOffersSection";
import AnimatedCategorySection from "@/components/AnimatedCategorySection";

export const revalidate = 300;

const isCleanImageUrl = (url: unknown): url is string =>
  typeof url === "string" &&
  url.trim().length > 0 &&
  !url.startsWith("data:") &&
  !url.includes("broken");

const getHomePageData = unstable_cache(
  () => Promise.all([
    db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
      category: products.category,
      createdAt: products.createdAt,
    }).from(products).orderBy(desc(products.createdAt)).limit(4),
    db.select().from(heroSlides).where(eq(heroSlides.isActive, 1)).orderBy(heroSlides.sortOrder),
    db.select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      image: categoriesTable.image,
      description: categoriesTable.description,
    }).from(categoriesTable)
      .where(and(eq(categoriesTable.isVisible, 1), eq(categoriesTable.displayOnHomepage, 1)))
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name)),
  ]),
  ["home-page-data"],
  { revalidate: 300 },
);

type HomePageData = Awaited<ReturnType<typeof getHomePageData>>;
const emptyHomePageData = [[], [], []] as unknown as HomePageData;

const defaultCategories = [
  { name: "Tiles", subtitle: "Floor & Wall Tiles", slug: "tiles", image: "" },
  { name: "Sanitaryware", subtitle: "Basins, Toilets & More", slug: "sanitaryware", image: "" },
  { name: "Fittings", subtitle: "Taps, Showers & Accessories", slug: "fittings", image: "" },
  { name: "Bathware", subtitle: "Showers, Panels & More", slug: "bathware", image: "" },
  { name: "Kitchen Solutions", subtitle: "Sinks & Accessories", slug: "kitchen-solutions", image: "" },
  { name: "Hardware & Essentials", subtitle: "Tools, Adhesives & More", slug: "hardware-essentials", image: "" },
];

export default async function HomePage() {
  const [latestProducts, activeHeroSlides, dbCategories] = await getHomePageData().catch((error) => {
    console.error("Unable to load homepage catalog data", error);
    return emptyHomePageData;
  });

  const productImages = latestProducts.map((product) => product.image).filter(isCleanImageUrl);

  const fallbackCategoryImages: Record<string, string> = {
    "floor-tiles": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    "wall-tiles": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    "bathroom-tiles": "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop",
    "sanitaryware": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    "faucets-taps": "https://images.unsplash.com/photo-1585758925574-d4bfa55eb5db?q=80&w=800&auto=format&fit=crop",
    "wash-basins": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    "toilets-wc": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    "bathroom-accessories": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  };

  // Use database categories if defined, otherwise fallback to defaults
  const displayCategories = dbCategories.length > 0
    ? dbCategories.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        subtitle: cat.description || `Explore ${cat.name}`,
        slug: cat.slug,
        image: (isCleanImageUrl(cat.image) ? cat.image : null) || fallbackCategoryImages[cat.slug] || productImages[idx % productImages.length] || "",
      }))
    : defaultCategories.map((def, idx) => ({
        id: def.slug,
        name: def.name,
        subtitle: def.subtitle,
        slug: def.slug,
        image: fallbackCategoryImages[def.slug] || productImages[idx % productImages.length] || "",
      }));

  return (
    <main className="overflow-hidden bg-[#fbf9f5] text-[#252322] font-sans">
      <Hero slides={activeHeroSlides} />

      {/* Motion-Powered Categories Section Right Below Hero */}
      <AnimatedCategorySection categories={displayCategories} />

      {/* Offers Section */}
      <DeferredOffersSection />

      {/* Featured Products */}
      <section className="bg-[#f5f1ea] px-4 py-9 sm:px-6 md:py-20 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-10 sm:gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a08b68]">Fresh from showroom</p>
              <h2 className="mt-1 font-serif text-2xl text-[#2c241d] sm:mt-2 md:text-4xl dark:text-white">Featured Pieces</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-[#6b4f2c] hover:underline dark:text-[#e2bd72]">
              Shop all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {latestProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group min-w-0 rounded-xl bg-white p-2.5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-stone-800 sm:rounded-2xl sm:p-3"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-900">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 639px) 46vw, (max-width: 1023px) 42vw, 22vw"
                    quality={70}
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-1 pb-2 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-stone-500 dark:text-stone-400">
                    {product.category}
                  </p>
                  <h3 className="mt-1 font-serif text-sm font-semibold text-[#2c241d] sm:text-lg dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-[#b49663]">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Strip (Exact items from design reference) */}
      <section className="border-t border-stone-200/80 bg-white py-10 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 text-center sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center rounded-xl p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3ec] text-[#b49663] dark:bg-stone-800">
              <Truck size={22} />
            </span>
            <h3 className="mt-3 font-semibold text-sm text-[#2c241d] dark:text-white">Fast & Reliable Delivery</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Across India</p>
          </div>

          <div className="flex flex-col items-center rounded-xl p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3ec] text-[#b49663] dark:bg-stone-800">
              <ShieldCheck size={22} />
            </span>
            <h3 className="mt-3 font-semibold text-sm text-[#2c241d] dark:text-white">100% Genuine Products</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Trusted Brands</p>
          </div>

          <div className="flex flex-col items-center rounded-xl p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3ec] text-[#b49663] dark:bg-stone-800">
              <Headphones size={22} />
            </span>
            <h3 className="mt-3 font-semibold text-sm text-[#2c241d] dark:text-white">Expert Support</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Helping You Build Better</p>
          </div>

          <div className="flex flex-col items-center rounded-xl p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3ec] text-[#b49663] dark:bg-stone-800">
              <Tag size={22} />
            </span>
            <h3 className="mt-3 font-semibold text-sm text-[#2c241d] dark:text-white">Exciting Offers</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Best Prices Always</p>
          </div>
        </div>
      </section>
    </main>
  );
}
