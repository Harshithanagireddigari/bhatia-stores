"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, ShieldCheck, Star, Truck } from "lucide-react";

const ROTATE_MS = 6000;

export type HeroSlide = {
  id: string;
  imageUrl: string;
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
};

const fallbackSlides: HeroSlide[] = [
  { id: "welcome", imageUrl: "", eyebrow: "Bhatia Stores", heading: "Crafting beautiful homes,", accent: "one tile at a time.", description: "Upload your first hero image and message from the Admin Launchpad to make this space entirely yours." },
];

export default function Hero({ slides = [] }: { slides?: HeroSlide[] }) {
  const activeSlides = slides.length ? slides : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const active = activeSlides[activeIndex % activeSlides.length];

  function startRotation() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (activeSlides.length < 2) return;
    intervalRef.current = setInterval(() => setActiveIndex((index) => (index + 1) % activeSlides.length), ROTATE_MS);
  }

  function pauseRotation() { if (intervalRef.current) clearInterval(intervalRef.current); }

  useEffect(() => {
    startRotation();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // The slide collection only changes on a page refresh after Launchpad updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlides.length]);

  function selectSlide(index: number) {
    setHasInteracted(true);
    setActiveIndex(index);
    startRotation();
  }

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-[#171412] font-sans">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity: 0, scale: 1 }} animate={{ opacity: 1, scale: 1.1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.8 }, scale: { duration: ROTATE_MS / 1000 + 1, ease: "linear" } }} className="absolute inset-0">
            {active.imageUrl ? <Image src={active.imageUrl} alt={active.heading} fill priority={!hasInteracted && activeIndex === 0} sizes="100vw" className="object-cover object-center" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_78%_22%,#b99c633b,transparent_26%),linear-gradient(130deg,#18120d,#584a3d)]" />}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5" />
      </div>

      <div className="relative z-10 flex h-full max-w-3xl flex-col justify-center gap-6 px-6 pb-28 pt-20 md:px-16">
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.45 }}>
            <div className="flex items-center gap-3"><span className="h-px w-8 bg-[#d7b45a]" /><span className="text-xs font-bold uppercase tracking-[.24em] text-[#d7b45a]">{active.eyebrow}</span></div>
            <h1 className="mt-6 font-serif text-5xl leading-[.98] text-[#f5f0e7] sm:text-6xl md:text-7xl">{active.heading}<br /><span className="text-[#e2bd72]">{active.accent}</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d0c9bf] md:text-lg">{active.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap gap-3">
          <a href="/shop" className="rounded-full bg-[#e2bd72] px-6 py-3 text-sm font-bold text-[#24190b] transition hover:bg-[#f4d690]">Explore products</a>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 pt-2 text-xs text-[#d0c9bf]"><span className="inline-flex items-center gap-1.5"><Star size={13} className="fill-[#e2bd72] text-[#e2bd72]" /> Premium selection</span><span className="inline-flex items-center gap-1.5"><Truck size={14} /> Reliable delivery</span><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Secure checkout</span></div>
      </div>

      {activeSlides.length > 1 && <div className="absolute bottom-8 right-6 z-20 flex max-w-[88vw] gap-2 rounded-full border border-white/15 bg-black/20 p-2 backdrop-blur-md md:right-16">{activeSlides.map((slide, index) => <button key={slide.id} type="button" onClick={() => selectSlide(index)} onMouseEnter={pauseRotation} onMouseLeave={startRotation} aria-label={`Show slide ${index + 1}`} aria-current={index === activeIndex} className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-9 bg-[#e2bd72]" : "w-2.5 bg-white/40 hover:bg-white/75"}`} />)}</div>}
      <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/55 xl:flex">Scroll to explore <ChevronDown size={14} /></div>
    </section>
  );
}
