import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { ArrowRight, Headphones, ShieldCheck, Tag, Truck } from "lucide-react";
import { db } from "@/db";
import { categories as categoriesTable, heroSlides, products } from "@/db/schema";
import Hero from "@/components/Hero";

export const dynamic = "force-dynamic";

const defaultCategories = [
  { name: "Tiles", subtitle: "Floor & Wall Tiles", slug: "tiles", image: "" },
  { name: "Sanitaryware", subtitle: "Basins, Toilets & More", slug: "sanitaryware", image: "" },
  { name: "Fittings", subtitle: "Taps, Showers & Accessories", slug: "fittings", image: "" },
  { name: "Bathware", subtitle: "Showers, Panels & More", slug: "bathware", image: "" },
  { name: "Kitchen Solutions", subtitle: "Sinks & Accessories", slug: "kitchen-solutions", image: "" },
  { name: "Hardware & Essentials", subtitle: "Tools, Adhesives & More", slug: "hardware-essentials", image: "" },
];

export default async function HomePage() {
  const [latestProducts, activeHeroSlides, dbCategories] = await Promise.all([
    db.select().from(products).orderBy(desc(products.createdAt)).limit(4),
    db.select().from(heroSlides).orderBy(heroSlides.sortOrder).then((slides) => slides.filter((slide) => slide.isActive === 1)),
    db.select().from(categoriesTable).where(and(eq(categoriesTable.isVisible, 1), eq(categoriesTable.displayOnHomepage, 1))).orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name)),
  ]);

  const productImages = latestProducts.map((product) => product.image).filter((img): img is string => typeof img === "string" && img.trim().length > 0);

  // Use database categories if defined, otherwise fallback to defaults
  const displayCategories = dbCategories.length > 0
    ? dbCategories.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        subtitle: cat.description || `Explore ${cat.name}`,
        slug: cat.slug,
        image: cat.image || productImages[idx % productImages.length] || "",
      }))
    : defaultCategories.map((def, idx) => ({
        id: def.slug,
        name: def.name,
        subtitle: def.subtitle,
        slug: def.slug,
        image: productImages[idx % productImages.length] || "",
      }));

  return (
    <main className="overflow-hidden bg-[#fbf9f5] text-[#252322] font-sans">
      <Hero slides={activeHeroSlides} />

      {/* Category Launchpad Section (Matches design reference) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[#a08b68]">Shop by category</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#2c241d] sm:text-4xl md:text-5xl">
            Explore Our Collections
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-12 bg-[#b49663]" />
        </div>

        {/* 6 Grid Launchpad Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-200 text-stone-400 dark:bg-stone-800">
                    <span className="font-serif text-lg text-stone-500">{cat.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#2c241d] group-hover:text-[#b49663] dark:text-white transition">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition group-hover:border-[#b49663] group-hover:bg-[#b49663] group-hover:text-white dark:border-stone-700">
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#f5f1ea] px-4 py-16 sm:px-6 md:py-20 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a08b68]">Fresh from showroom</p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl text-[#2c241d] dark:text-white">Featured Pieces</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-[#6b4f2c] hover:underline dark:text-[#e2bd72]">
              Shop all →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-stone-800"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-900">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-1 pb-2 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-stone-500 dark:text-stone-400">
                    {product.category}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-[#2c241d] dark:text-white line-clamp-1">
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
