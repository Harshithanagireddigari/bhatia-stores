import Link from "next/link";
import { desc } from "drizzle-orm";
import { ArrowRight, Bath, Check, Grid3X3, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { db } from "@/db";
import { heroSlides, products } from "@/db/schema";
import Hero from "@/components/Hero";
import { logServerError } from "@/lib/security/logger";

export const dynamic = "force-dynamic";

const categories = [
  { title: "Floor & Wall Tiles", copy: "Stone, marble and pattern-led surfaces for every room.", note: "Browse tiles", style: "bg-[#8e877f]", Icon: Grid3X3 },
  { title: "Large Format", copy: "Architectural slabs with fewer joins and more impact.", note: "Explore large format", style: "bg-[#b0a394]", Icon: Sparkles },
  { title: "Bath & Sanitaryware", copy: "Essential pieces for a more considered daily ritual.", note: "Shop bathroom", style: "bg-[#5b625e]", Icon: Bath },
];

export default async function HomePage() {
  let latestProducts: (typeof products.$inferSelect)[] = [];
  let activeHeroSlides: (typeof heroSlides.$inferSelect)[] = [];

  try {
    const results = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)).limit(4),
      db.select().from(heroSlides).orderBy(heroSlides.sortOrder).then((slides) => slides.filter((slide) => slide.isActive === 1)),
    ]);
    latestProducts = results[0];
    activeHeroSlides = results[1];
  } catch (err) {
    logServerError("home.load", err);
  }

  const imageUrls = latestProducts.map((product) => product.image).filter((image) => image.startsWith("https://"));
  return <main className="overflow-hidden bg-[#f8f6f1] text-[#252322]"><Hero slides={activeHeroSlides} />
    <section className="border-y border-[#ded8cd] bg-[#fdfcf9] py-5"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-6 text-center sm:grid-cols-4">{["Curated premium brands", "Expert design guidance", "Secure checkout", "WhatsApp assistance"].map((item) => <p key={item} className="border-[#ded8cd] px-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#69645c] sm:border-r last:border-0">{item}</p>)}</div></section>
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="eyebrow">Designed for real spaces</p><h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Start with the surface.</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-semibold text-[#4a3373] hover:text-[#252322] sm:flex">View all products <ArrowRight size={16} /></Link></div><div className="grid gap-5 md:grid-cols-12 md:grid-rows-2">{categories.map((category, index) => { const CategoryIcon = category.Icon; const size = index === 0 ? "md:col-span-7 md:row-span-2 min-h-[540px]" : "md:col-span-5 min-h-[260px]"; return <Link key={category.title} href="/shop" className={`group relative overflow-hidden p-7 text-white ${category.style} ${size}`}>{imageUrls[index] && <img src={imageUrls[index]} alt={category.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}<div className="absolute -right-14 -top-20 h-72 w-72 rounded-full border-[28px] border-white/15 transition duration-700 group-hover:scale-110"/><div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 via-black/15 to-transparent"/><div className="relative flex h-full flex-col justify-between"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm"><CategoryIcon size={20}/></span><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/70">0{index + 1}</span></div><div className="max-w-sm"><p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#f4d690]">{category.note}</p><h3 className="mt-3 font-serif text-4xl leading-none md:text-5xl">{category.title}</h3><p className="mt-4 max-w-xs text-sm leading-6 text-white/80">{category.copy}</p><span className="mt-6 inline-flex items-center gap-2 border-b border-[#f4d690] pb-2 text-sm font-semibold">Explore now <ArrowRight size={15} /></span></div></div></Link> })}</div></section>
    <section className="bg-[#272522] px-6 py-20 text-[#f7f2e7] md:py-28"><div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end"><div><p className="eyebrow !text-[#d2ad62]">Bhatia selection</p><h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">The details make the room.</h2><p className="mt-6 max-w-md text-base leading-7 text-[#c8c2b8]">Discover tiles, fixtures and finishes chosen for homes that feel thoughtfully put together.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 border-b border-[#d2ad62] pb-2 text-sm font-semibold text-[#f2d692]">Shop the edit <ArrowRight size={16} /></Link></div><div className="grid grid-cols-2 gap-4">{imageUrls.slice(1, 3).map((image, index) => <img key={image} className={`${index === 0 ? "mt-10" : ""} aspect-[.8] w-full object-cover`} src={image} alt="Bhatia Stores product finish" />)}</div></div></section>
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="eyebrow">Fresh from the showroom</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Featured pieces.</h2></div><Link href="/shop" className="text-sm font-semibold text-[#4a3373] hover:text-[#252322]">Shop all →</Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{latestProducts.map((product) => <Link key={product.id} href={`/product/${product.id}`} className="group bg-[#fdfcf9] p-3 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40"><div className="aspect-square overflow-hidden bg-[#ece7dd]"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="px-1 pb-2 pt-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#82786a]">{product.category}</p><h3 className="mt-2 font-serif text-xl">{product.name}</h3><p className="mt-3 text-sm font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</p></div></Link>)}</div></section>
    <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-28"><div className="grid overflow-hidden bg-[#e9e1d4] md:grid-cols-2">{imageUrls[3] && <img src={imageUrls[3]} alt="Premium Bhatia Stores tile" className="h-full min-h-[320px] w-full object-cover" />}<div className="flex flex-col justify-center p-9 md:p-16"><p className="eyebrow">Planning a larger project?</p><h2 className="mt-3 font-serif text-4xl leading-tight">Let’s shape your space together.</h2><p className="mt-5 max-w-md leading-7 text-[#625c54]">Share your room, style and measurements with our team for product recommendations and a tailored quote.</p><a className="mt-8 inline-flex w-fit items-center gap-2 bg-[#4a3373] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#352455]" href="https://wa.me/919120435950" target="_blank" rel="noreferrer"><MessageCircle size={17} /> Ask on WhatsApp</a></div></div></section>
    <section className="border-t border-[#ded8cd] bg-[#fdfcf9] py-14"><div className="mx-auto grid max-w-7xl gap-8 px-6 text-center sm:grid-cols-3">{[[Truck,"Reliable delivery","Carefully dispatched for your project."],[ShieldCheck,"Secure payments","Simple, trusted Prepaid checkout."],[Check,"Premium selection","Established brands and considered finishes."]].map(([Icon,title,copy]) => { const FeatureIcon = Icon as typeof Truck; return <div key={title as string}><FeatureIcon className="mx-auto text-[#a8833d]" size={24}/><h3 className="mt-3 font-serif text-xl">{title as string}</h3><p className="mt-2 text-sm text-[#716a61]">{copy as string}</p></div> })}</div></section>
  </main>;
}
