"use client";

import { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageViewerModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function ImageViewerModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  productName,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  // Keyboard navigation (Esc to close, Left/Right for images)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    handleResetZoom();
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    handleResetZoom();
  };

  // Mouse pan/drag handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-xl text-white select-none">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="max-w-md truncate">
          <h3 className="text-sm font-semibold text-white truncate">{productName}</h3>
          <p className="text-xs text-stone-400">
            Image {currentIndex + 1} of {images.length} {zoomLevel > 1 && `• ${(zoomLevel * 100).toFixed(0)}% Zoom`}
          </p>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn size={18} />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut size={18} />
          </button>

          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
              <span>100%</span>
            </button>
          )}

          <div className="mx-2 h-6 w-px bg-white/20" />

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-red-600 transition-colors"
            title="Close Viewer (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Center Image Display Area */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage}
          alt={productName}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-auto"
        />

        {/* Prev / Next Image Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900/80 text-white shadow-xl hover:bg-amber-600 transition-colors backdrop-blur-md"
            >
              <ChevronLeft size={26} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900/80 text-white shadow-xl hover:bg-amber-600 transition-colors backdrop-blur-md"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Filmstrip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-3 border-t border-white/10 bg-stone-900/80 p-4 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                handleResetZoom();
              }}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                currentIndex === idx
                  ? "border-amber-400 scale-105 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
