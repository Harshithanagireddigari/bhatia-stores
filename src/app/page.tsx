import Link from "next/link";
import { db } from "@/db";
import { products, launchpadBanners, settings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import HomeContactSection from "@/components/HomeContactSection";
import PromoBanner from "@/components/PromoBanner";
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  Clock,
  ArrowRight,
  Compass,
  CheckCircle2,
  Droplets,
  Bath,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch products from database
  const allProducts: any[] = await db.select().from(products).orderBy(desc(products.createdAt));

  // Featured tiles
  const featuredProducts = allProducts.filter((p: any) => p.featured === 1).slice(0, 8);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 8);

  // Popular Floor & Wall Tiles
  const popularTiles = allProducts
    .filter((p: any) => p.category?.includes("Tiles") || p.category?.includes("Charge") || p.category?.includes("Matt"))
    .slice(0, 8);

  // Sanitaryware & Faucets
  const sanitarywareProducts = allProducts
    .filter((p: any) => p.category?.includes("Sanitaryware") || p.category?.includes("Faucet"))
    .slice(0, 4);

  // Active Promo Banner
  const banners: any[] = await db.select().from(launchpadBanners).where(eq(launchpadBanners.active, 1)).limit(1);
  const promo = banners[0] || null;

  // Categories highlight list
  const categoryTiles = [
    {
      title: "PGVT Vitrified Slabs",
      subtitle: "600x1200 mm High Gloss",
      image: "/products/new-stock/pgvt-01.jpg",
      href: "/shop?category=Vitrified+Floor+Tiles",
      count: "Slabs & Endless Veins",
    },
    {
      title: "Double Charge Tiles",
      subtitle: "600x600 mm Heavy Duty",
      image: "/products/new-stock/gnam-dc-01.jpg",
      href: "/shop?category=Double+Charge",
      count: "High-Traffic Flooring",
    },
    {
      title: "Digital Wall Tiles",
      subtitle: "300x450 mm Waterproof Ceramic",
      image: "/products/catalog/gnam-wall-01.jpg",
      href: "/shop?category=Digital+Wall+Tiles",
      count: "Kitchen & Bath Accents",
    },
    {
      title: "Italian Sanitaryware",
      subtitle: "Rimless Toilets & Vessel Basins",
      image: "/products/catalog/hindware-01.jpg",
      href: "/shop?category=Sanitaryware+%26+Faucets",
      count: "Designer Bathroom Suites",
    },
    {
      title: "Satin Matt Porcelain",
      subtitle: "600x600 mm Tactile Finish",
      image: "/products/catalog/suncore-matt-01.jpg",
      href: "/shop?category=Satin+Matt",
      count: "Anti-Skid Contemporary",
    },
    {
      title: "Step & Riser Systems",
      subtitle: "Full Bullnose Grooved Stair Sets",
      image: "/products/catalog/step-riser-01.jpg",
      href: "/shop?category=Step+%26+Riser",
      count: "Monolithic Stair Treads",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-stone-900 dark:bg-stone-950 dark:text-stone-100 min-h-screen">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Promotional Banner (if active) */}
      {promo && (
        <PromoBanner
          title={promo.title}
          subtitle={promo.subtitle}
          code={promo.code}
          discountPercent={promo.discountPercent}
          link={promo.link || "/shop"}
        />
      )}

      {/* 3. Category Highlights Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <Compass size={14} />
              <span>Showroom Collections</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
              Curated Architectural Surfaces
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-900 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <span>Explore All 80+ Designs</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTiles.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group relative h-80 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-900 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-stone-800"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108 brightness-90 group-hover:brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                <span className="text-[11px] font-medium tracking-widest uppercase text-amber-300">
                  {cat.count}
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1 group-hover:text-amber-200 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-300 mt-1">{cat.subtitle}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-amber-300">
                  <span>Browse Category</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Tiles & Slabs */}
      <section className="bg-[#F5EFEB] py-16 lg:py-24 border-y border-stone-200/60 dark:bg-stone-900/60 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                <Sparkles size={14} />
                <span>Featured Releases</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
                Handcrafted & Vitrified Tile Edit
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-900 shadow-xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-white transition-all"
            >
              <span>View Full Shop Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayFeatured.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Popular Vitrified & Floor Tiles Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <Layers size={14} />
              <span>Best Selling Surfaces</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
              Popular Living & Corridor Flooring
            </h2>
          </div>
          <Link
            href="/shop?category=Double+Charge"
            className="text-sm font-semibold text-purple-900 hover:text-amber-700 dark:text-amber-400 transition-colors"
          >
            Explore Double Charge Tiles →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTiles.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Sanitaryware & Faucets Showcase */}
      <section className="bg-stone-900 text-white py-16 lg:py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
                <Bath size={13} />
                <span>Italian Sanitaryware & Faucets</span>
              </div>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Transform Your Bathroom into a Sanctuary
              </h2>
              <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
                Experience high-performance Italian-designed sanitary fixtures, rimless tornado flush WC suites, sculpted art basins, and PVD brushed brassware built for longevity.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/shop?category=Sanitaryware+%26+Faucets"
                  className="rounded-full bg-amber-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-amber-500 transition-all"
                >
                  Explore Sanitaryware Range
                </Link>
                <a
                  href="https://wa.me/919984979720?text=Hello%20Bhatia%20Stores,%20I%20am%20interested%20in%20your%20Italian%20Sanitaryware%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <MessageCircle size={16} className="text-emerald-400" />
                  <span>Get Bath Layout Quote</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <span className="text-2xl font-bold text-amber-400 font-serif">360°</span>
                <h4 className="font-semibold text-sm mt-1 text-white">Rimless Flush</h4>
                <p className="text-xs text-stone-400 mt-1">Hygienic easy-clean anti-bacterial glaze.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <span className="text-2xl font-bold text-amber-400 font-serif">PVD</span>
                <h4 className="font-semibold text-sm mt-1 text-white">Gold & Matte Finishes</h4>
                <p className="text-xs text-stone-400 mt-1">Corrosion-proof lifetime brass fixtures.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <span className="text-2xl font-bold text-amber-400 font-serif">UF</span>
                <h4 className="font-semibold text-sm mt-1 text-white">Soft Close Seats</h4>
                <p className="text-xs text-stone-400 mt-1">Quiet gentle close hydraulic dampeners.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <span className="text-2xl font-bold text-amber-400 font-serif">100%</span>
                <h4 className="font-semibold text-sm mt-1 text-white">Direct Warranty</h4>
                <p className="text-xs text-stone-400 mt-1">Authentic OEM showroom guarantee.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sanitarywareProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Trust Indicators Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-300">
              <Truck size={24} />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-white">
              Fast Regional Delivery
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Safe hydraulic crate packaging and fast dispatch across all regional pin codes.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <ShieldCheck size={24} />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-white">
              Prepaid & COD Options
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Prepaid online checkout (UPI/Cards) and Cash on Delivery supported.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-white">
              100% Genuine Quality
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Factory batch inspected vitrified tiles with zero shade variance.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              <MessageCircle size={24} />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-white">
              WhatsApp Concierge
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Get tile quantity estimates, catalog PDFs, and custom freight quotes instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Contact Us Section (Toward the END of the customer website) */}
      <HomeContactSection />
    </div>
  );
}
