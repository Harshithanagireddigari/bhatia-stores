import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MessageCircle, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
};

const fallbackSlide: HeroSlide = {
  id: "welcome",
  imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=75",
  eyebrow: "THE BHATIAS PREMIUM HARDWARE STORE",
  heading: "Elevate Every Space,",
  accent: "with luxury surfaces & fittings.",
  description: "Discover handcrafted tiles, Italian sanitaryware, faucets, and architectural hardware designed for modern living.",
};

function isVideo(url: string) {
  const value = url.toLowerCase();
  return value.endsWith(".mp4") || value.endsWith(".webm") || value.includes("video/upload") || value.includes("mixkit");
}

function optimizeCloudinaryHero(url: string) {
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1920/");
  }
  return url;
}

export default function Hero({ slides = [] }: { slides?: HeroSlide[] }) {
  // The launchpad currently presents the first active slide. Rendering it on the server
  // makes the LCP content visible without waiting for a client animation bundle.
  const active = slides[0] || fallbackSlide;
  const hasVideo = active.imageUrl && isVideo(active.imageUrl);
  const heroImage = optimizeCloudinaryHero(active.imageUrl || fallbackSlide.imageUrl);

  return (
    <section className="relative h-[340px] w-full overflow-hidden bg-[#12100e] font-sans sm:h-[520px] md:h-screen md:min-h-[700px]">
      <div className="absolute inset-0 z-0">
        {hasVideo ? (
          <video autoPlay loop muted playsInline preload="metadata" poster={fallbackSlide.imageUrl} className="h-full w-full scale-105 object-cover opacity-85">
            <source src={active.imageUrl} />
          </video>
        ) : (
          <Image src={heroImage} alt={active.heading} fill priority sizes="100vw" quality={75} className="scale-105 object-cover opacity-85" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 flex h-full max-w-4xl flex-col justify-end gap-3 px-5 pb-6 pt-8 sm:justify-center sm:gap-6 sm:px-6 sm:pb-24 sm:pt-20 md:px-16">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#c5a059]/40 shadow-lg">
            <Image src="/logo.png" alt="The Bhatias Logo" fill sizes="48px" className="object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#c5a059]">THE BHATIAS</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-300">PREMIUM HARDWARE & SANITARYWARE</p>
          </div>
        </div>

        <div className="hero-copy-enter">
          <h1 className="font-serif text-[1.8rem] font-bold leading-[1.05] text-white sm:mt-2 sm:text-6xl md:text-7xl">
            {active.heading}
            <br />
            <span className="text-[#c5a059]">{active.accent}</span>
          </h1>
          <p className="mt-4 hidden max-w-xl text-sm leading-7 text-stone-300 sm:block md:text-base">{active.description}</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 sm:gap-4">
          <Link href="/shop" className="inline-flex items-center gap-2 rounded-lg bg-[#c5a059] px-4 py-2.5 text-xs font-bold text-stone-900 shadow-xl transition hover:bg-[#b49663] sm:rounded-2xl sm:px-7 sm:py-3.5">
            <ShoppingBag size={17} />
            <span>Explore Collection</span>
          </Link>
          <a href="https://wa.me/919120435950" className="hidden items-center gap-2 rounded-2xl border border-white/25 bg-black/40 px-6 py-3.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/10 sm:inline-flex">
            <MessageCircle size={17} className="text-[#c5a059]" />
            <span>WhatsApp Consultation</span>
          </a>
        </div>

        <div className="hidden flex-wrap gap-x-6 gap-y-2 pt-4 text-xs text-stone-300 sm:flex">
          <span className="inline-flex items-center gap-1.5 font-medium"><Star size={14} className="fill-[#c5a059] text-[#c5a059]" /> Premium Quality Guarantee</span>
          <span className="inline-flex items-center gap-1.5 font-medium"><Truck size={15} className="text-[#c5a059]" /> All-India Safe Delivery</span>
          <span className="inline-flex items-center gap-1.5 font-medium"><ShieldCheck size={15} className="text-[#c5a059]" /> 100% Verified Products</span>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50 xl:flex">
        <span>Scroll to Explore</span>
        <ChevronDown size={14} className="animate-bounce text-[#c5a059]" />
      </div>
    </section>
  );
}
