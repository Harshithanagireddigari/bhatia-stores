"use client";

import { useState, useRef, useEffect } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw, Sparkles, Layers } from "lucide-react";

interface ProductImageZoomProps {
  src: string;
  alt: string;
  galleryImages?: string[];
}

export default function ProductImageZoom({ src, alt, galleryImages }: ProductImageZoomProps) {
  // Gallery images list (main image + alternate detail/angle views)
  const allImages = galleryImages && galleryImages.length > 0 
    ? galleryImages 
    : [src];

  const [activeIndex, setActiveIndex] = useState(0);
  const currentSrc = allImages[activeIndex] || src;

  // Zoom mode: "side" (Amazon-style side pop-out panel) or "inline" (embedded magnifying glass lens)
  const [zoomMode, setZoomMode] = useState<"side" | "inline">("side");

  // Desktop Side/Inline Magnifier Lens state
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 }); // percentages
  const [mousePixelPos, setMousePixelPos] = useState({ x: 0, y: 0 }); // absolute pixels
  const [lensPos, setLensPos] = useState({ left: 0, top: 0, width: 140, height: 140 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Mobile pinch-to-zoom state
  const [touchScale, setTouchScale] = useState(1);
  const [touchPan, setTouchPan] = useState({ x: 0, y: 0 });
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialTouchScaleRef = useRef<number>(1);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  // Handle Desktop Mouse Move for Side & Inline Magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Mouse coordinates inside container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePixelPos({ x: mouseX, y: mouseY });

    // Percentages (0 to 100)
    const xPct = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, (mouseY / rect.height) * 100));

    setCursorPos({ x: xPct, y: yPct });

    // Lens box sizing & position
    const lensWidth = Math.min(160, rect.width * 0.35);
    const lensHeight = Math.min(160, rect.height * 0.35);

    const left = Math.max(0, Math.min(rect.width - lensWidth, mouseX - lensWidth / 2));
    const top = Math.max(0, Math.min(rect.height - lensHeight, mouseY - lensHeight / 2));

    setLensPos({ left, top, width: lensWidth, height: lensHeight });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") setActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      if (e.key === "ArrowRight") setActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  // Mobile Touch Gestures for Main Frame
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistanceRef.current = dist;
      initialTouchScaleRef.current = touchScale;
    } else if (e.touches.length === 1) {
      // Pan start
      touchStartPosRef.current = {
        x: e.touches[0].clientX - touchPan.x,
        y: e.touches[0].clientY - touchPan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialTouchDistanceRef.current;
      const newScale = Math.min(3, Math.max(1, initialTouchScaleRef.current * factor));
      setTouchScale(newScale);
    } else if (e.touches.length === 1 && touchScale > 1) {
      const newX = e.touches[0].clientX - touchStartPosRef.current.x;
      const newY = e.touches[0].clientY - touchStartPosRef.current.y;
      setTouchPan({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
    if (touchScale <= 1) {
      setTouchPan({ x: 0, y: 0 });
    }
  };

  // Lightbox Pan Handlers
  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    if (lightboxZoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - lightboxPan.x,
      y: e.clientY - lightboxPan.y,
    };
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || lightboxZoom <= 1) return;
    setLightboxPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleLightboxMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full space-y-4 font-sans">
      {/* MAIN GALLERY DISPLAY AREA */}
      <div className="relative w-full overflow-visible">
        {/* Main Image Frame Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsLightboxOpen(true)}
          className="group relative aspect-square w-full cursor-crosshair overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm dark:border-stone-700 dark:bg-stone-900"
        >
          {/* Main Display Image */}
          <img
            src={currentSrc}
            alt={alt}
            draggable={false}
            style={{
              transform: `scale(${touchScale}) translate(${touchPan.x / touchScale}px, ${touchPan.y / touchScale}px)`,
              transition: touchScale === 1 ? "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
            }}
            className="h-full w-full select-none object-contain p-2"
          />

          {/* Lens Indicator Box (Desktop Hover for Side Zoom Mode) */}
          {isHovered && zoomMode === "side" && (
            <div
              style={{
                left: `${lensPos.left}px`,
                top: `${lensPos.top}px`,
                width: `${lensPos.width}px`,
                height: `${lensPos.height}px`,
              }}
              className="pointer-events-none absolute hidden border-2 border-amber-500 bg-amber-500/20 backdrop-blur-[1px] dark:border-amber-400 dark:bg-amber-400/25 lg:block rounded-lg shadow-sm"
            />
          )}

          {/* Embedded Lens Glass (Inline Zoom Mode) */}
          {isHovered && zoomMode === "inline" && (
            <div
              style={{
                left: `${mousePixelPos.x - 90}px`,
                top: `${mousePixelPos.y - 90}px`,
                width: "180px",
                height: "180px",
                backgroundImage: `url(${currentSrc})`,
                backgroundPosition: `${cursorPos.x}% ${cursorPos.y}%`,
                backgroundSize: "300%",
              }}
              className="pointer-events-none absolute hidden rounded-full border-4 border-amber-500 bg-white shadow-[0_15px_35px_rgba(0,0,0,0.3)] dark:border-amber-400 dark:bg-stone-900 lg:block z-40"
            />
          )}

          {/* Quick Click Hint & Mode Switch Badge */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-opacity group-hover:bg-black/85">
            <ZoomIn size={14} className="text-amber-400" /> Hover to inspect · Click for fullscreen
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {/* Zoom Mode Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomMode((prev) => (prev === "side" ? "inline" : "side"));
              }}
              title={zoomMode === "side" ? "Switch to Floating Magnifying Glass" : "Switch to Side Panel Zoom"}
              className="hidden items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-stone-700 shadow-md backdrop-blur transition hover:bg-amber-50 hover:text-amber-700 dark:bg-stone-800/95 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-amber-400 lg:flex"
            >
              <Layers size={13} className="text-amber-500" />
              {zoomMode === "side" ? "Side Panel" : "Lens Glass"}
            </button>

            {/* Expand Fullscreen Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              aria-label="Open Fullscreen Gallery"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md backdrop-blur transition hover:bg-white hover:text-indigo-600 dark:bg-stone-800/90 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-indigo-400"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* DESKTOP SIDE MAGNIFIED PANEL (AMAZON-STYLE POPUP TO THE RIGHT OVER PRODUCT DETAILS) */}
        {isHovered && zoomMode === "side" && (
          <div
            style={{
              backgroundImage: `url(${currentSrc})`,
              backgroundPosition: `${cursorPos.x}% ${cursorPos.y}%`,
              backgroundSize: "280%",
            }}
            className="pointer-events-none absolute left-[103%] top-0 z-[100] hidden h-full w-[100%] overflow-hidden rounded-2xl border-2 border-amber-500/70 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.22)] transition-opacity duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] dark:border-amber-400/80 dark:bg-stone-900 lg:block"
          >
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3.5 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md shadow-sm">
              <Sparkles size={13} /> High Detail Inspection
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-stone-300 backdrop-blur-md">
              Position: {Math.round(cursorPos.x)}%, {Math.round(cursorPos.y)}%
            </div>
          </div>
        )}
      </div>

      {/* THUMBNAIL SELECTOR BAR */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                activeIndex === idx
                  ? "border-amber-500 shadow-md ring-2 ring-amber-500/30 dark:border-amber-400"
                  : "border-stone-200 opacity-70 hover:opacity-100 dark:border-stone-700"
              }`}
            >
              <img
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/92 backdrop-blur-md animate-fade-in"
          onMouseDown={handleLightboxMouseDown}
          onMouseMove={handleLightboxMouseMove}
          onMouseUp={handleLightboxMouseUp}
        >
          {/* Top Bar Controls */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-stone-300">
                {activeIndex + 1} / {allImages.length}
              </span>
              <span className="hidden sm:inline text-xs text-stone-400">| Use mouse wheel or controls to zoom</span>
            </div>

            {/* Zoom Button Controls */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setLightboxZoom((z) => Math.max(1, z - 0.5));
                  if (lightboxZoom <= 1.5) setLightboxPan({ x: 0, y: 0 });
                }}
                disabled={lightboxZoom <= 1}
                className="rounded-full p-2 text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="Zoom out"
              >
                <Minus size={18} />
              </button>
              <span className="min-w-12 text-center text-xs font-bold">{Math.round(lightboxZoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(4, z + 0.5))}
                disabled={lightboxZoom >= 4}
                className="rounded-full p-2 text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="Zoom in"
              >
                <Plus size={18} />
              </button>
              {lightboxZoom > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setLightboxZoom(1);
                    setLightboxPan({ x: 0, y: 0 });
                  }}
                  className="rounded-full p-2 text-white hover:bg-white/20"
                  aria-label="Reset zoom"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close Lightbox"
            >
              <X size={22} />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div
            className={`relative flex h-full w-full items-center justify-center p-6 ${
              lightboxZoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            }`}
            onWheel={(e) => {
              e.preventDefault();
              setLightboxZoom((prev) => Math.min(4, Math.max(1, prev + (e.deltaY < 0 ? 0.3 : -0.3))));
            }}
          >
            <img
              src={currentSrc}
              alt={alt}
              draggable={false}
              style={{
                transform: `scale(${lightboxZoom}) translate(${lightboxPan.x / lightboxZoom}px, ${
                  lightboxPan.y / lightboxZoom
                }px)`,
                transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
              className="max-h-[85vh] max-w-[85vw] select-none object-contain transition-transform"
            />
          </div>

          {/* Lightbox Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                  setLightboxZoom(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-white/20"
                aria-label="Previous Image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                  setLightboxZoom(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-white/20"
                aria-label="Next Image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Bottom Thumbnail Strip in Lightbox */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/60 p-2 backdrop-blur-md">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                    setLightboxZoom(1);
                    setLightboxPan({ x: 0, y: 0 });
                  }}
                  className={`h-12 w-12 overflow-hidden rounded-full border-2 transition-all ${
                    activeIndex === idx ? "border-amber-400 scale-110" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
