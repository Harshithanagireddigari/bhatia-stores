"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const OffersBannerSection = dynamic(() => import("./OffersBannerSection"));

export default function DeferredOffersSection() {
  const markerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  return <div ref={markerRef}>{shouldLoad ? <OffersBannerSection /> : null}</div>;
}
