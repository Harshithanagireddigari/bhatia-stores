"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Play, Pause, ShieldCheck, Star, Truck, ShoppingBag } from "lucide-react";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
};

const fallbackSlides: HeroSlide[] = [
  {
    id: "welcome",
    imageUrl: "",
    eyebrow: "THE BHATIAS PREMIUM HARDWARE STORE",
    heading: "Elevate Every Space,",
    accent: "with luxury surfaces & fittings.",
    description: "Discover handcrafted tiles, Italian sanitaryware, faucets, and architectural hardware designed for modern living.",
  },
];

export default function Hero({ slides = [] }: { slides?: HeroSlide[] }) {
  const activeSlides = slides.length ? slides : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = activeSlides[activeIndex % activeSlides.length];

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlayingVideo(!isPlayingVideo);
    }
  };

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-[#12100e] font-sans">
      
      {/* BACKGROUND LUXURY VIDEO / IMAGE CONTAINER */}
      <div className="absolute inset-0 z-0">
        {active.imageUrl && !active.imageUrl.toLowerCase().endsWith(".mp4") && !active.imageUrl.toLowerCase().endsWith(".webm") && !active.imageUrl.includes("video/upload") && !active.imageUrl.includes("mixkit") ? (
          <img
            key={active.id}
            src={active.imageUrl}
            alt={active.heading}
            className="h-full w-full object-cover scale-105 opacity-85 transition-opacity duration-1000"
          />
        ) : (
          <video
            ref={videoRef}
            key={active.id || active.imageUrl}
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
            className="h-full w-full object-cover scale-105 opacity-85 transition-opacity duration-1000"
          >
            <source
              src={active.imageUrl || "https://assets.mixkit.co/videos/preview/mixkit-modern-bathroom-interior-with-a-tub-41551-large.mp4"}
            />
          </video>
        )}

        {/* LUXURY GRADIENT OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex h-full max-w-4xl flex-col justify-center gap-6 px-6 pb-24 pt-20 md:px-16">
        
        {/* BRAND LOGO EMBEDDED IN HERO */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#c5a059]/40 shadow-lg">
            <Image
              src="/logo.png"
              alt="The Bhatias Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#c5a059]">
              THE BHATIAS
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              PREMIUM HARDWARE & SANITARYWARE
            </p>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mt-2 font-serif text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl font-bold">
            {active.heading}
            <br />
            <span className="text-[#c5a059]">{active.accent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 md:text-base">
            {active.description}
          </p>
        </motion.div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#c5a059] px-7 py-3.5 text-xs font-bold text-stone-900 shadow-xl hover:bg-[#b49663] transition"
          >
            <ShoppingBag size={17} />
            <span>Explore Collection</span>
          </a>

          <a
            href="https://wa.me/919120435950"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-black/40 px-6 py-3.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <MessageCircle size={17} className="text-[#c5a059]" />
            <span>WhatsApp Consultation</span>
          </a>

          {/* VIDEO CONTROLLER BUTTON */}
          <button
            onClick={toggleVideoPlay}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 px-4 py-3.5 text-xs font-bold text-stone-300 backdrop-blur-md transition hover:bg-white/10"
            title={isPlayingVideo ? "Pause Hero Video" : "Play Hero Video"}
          >
            {isPlayingVideo ? <Pause size={15} className="text-[#c5a059]" /> : <Play size={15} className="text-[#c5a059]" />}
            <span>{isPlayingVideo ? "Pause Video" : "Play Video"}</span>
          </button>
        </div>

        {/* TRUST BADGES */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs text-stone-300">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Star size={14} className="fill-[#c5a059] text-[#c5a059]" /> Premium Quality Guarantee
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Truck size={15} className="text-[#c5a059]" /> All-India Safe Delivery
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck size={15} className="text-[#c5a059]" /> 100% Verified Products
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50 xl:flex">
        <span>Scroll to Explore</span>
        <ChevronDown size={14} className="animate-bounce text-[#c5a059]" />
      </div>
    </section>
  );
}
