"use client";

import { Minus, Plus, RotateCcw, ZoomIn } from "lucide-react";
import { useRef, useState } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export default function ProductImageZoom({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [origin, setOrigin] = useState("50% 50%");
  const imageFrame = useRef<HTMLDivElement>(null);
  const isZoomed = zoom > MIN_ZOOM;

  function updateZoom(next: number) {
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(1)))));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isZoomed || !imageFrame.current) return;
    const bounds = imageFrame.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      <div
        ref={imageFrame}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setOrigin("50% 50%")}
        onWheel={(event) => {
          event.preventDefault();
          updateZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
        }}
        className={`flex min-h-[24rem] items-center justify-center overflow-hidden ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        aria-label="Product image. Use the zoom controls to inspect the product."
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
          className="max-h-[32rem] w-full select-none object-contain transition-transform duration-150"
        />
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 p-1 shadow-lg backdrop-blur dark:bg-gray-900/95">
        <button type="button" onClick={() => updateZoom(zoom - ZOOM_STEP)} disabled={!isZoomed} aria-label="Zoom out" className="rounded-full p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800">
          <Minus size={18} />
        </button>
        <span className="min-w-11 text-center text-xs font-semibold text-gray-700 dark:text-gray-200">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => updateZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in" className="rounded-full p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800">
          <Plus size={18} />
        </button>
        {isZoomed && <button type="button" onClick={() => updateZoom(MIN_ZOOM)} aria-label="Reset zoom" className="rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"><RotateCcw size={16} /></button>}
      </div>
      {!isZoomed && <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white"><ZoomIn size={14} /> Scroll or use + to zoom</div>}
    </div>
  );
}
