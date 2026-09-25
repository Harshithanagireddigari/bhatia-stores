"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingCart, Home, Bath, Utensils, Armchair, Trees, CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/CartContext";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

type RoomType = "bathroom" | "hall" | "kitchen" | "outdoor";

interface StepConfig {
  key: string;
  title: string;
  keywords: string[];
  fallbackImage: string;
  fallbackName: string;
  fallbackPrice: string;
}

const ROOM_SUITES: Record<RoomType, { label: string; icon: any; description: string; steps: StepConfig[] }> = {
  bathroom: {
    label: "Bathroom Suite",
    icon: Bath,
    description: "Design a luxury bathroom suite with matching basin, faucet, shower, toilet, and LED mirror.",
    steps: [
      {
        key: "basin",
        title: "1. Wash Basin",
        keywords: ["basin", "wash", "countertop basin"],
        fallbackImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Ceramic Table Top Wash Basin",
        fallbackPrice: "3499",
      },
      {
        key: "faucet",
        title: "2. Basin Mixer / Faucet",
        keywords: ["faucet", "tap", "mixer", "pillar"],
        fallbackImage: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Single Lever Brass Basin Mixer (Chrome)",
        fallbackPrice: "2999",
      },
      {
        key: "shower",
        title: "3. Overhead Rain Shower",
        keywords: ["shower", "overhead", "rain"],
        fallbackImage: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Multi-Flow Rain Shower Arm System",
        fallbackPrice: "4499",
      },
      {
        key: "toilet",
        title: "4. Water Closet / Toilet",
        keywords: ["toilet", "closet", "sanitary", "commode"],
        fallbackImage: "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Wall-Hung Premium Ceramic Water Closet",
        fallbackPrice: "8999",
      },
    ],
  },
  hall: {
    label: "Living Room & Hall Suite",
    icon: Armchair,
    description: "Elevate your main hall with premium floor tiles, wall cladding, and architectural door fittings.",
    steps: [
      {
        key: "hall_floor",
        title: "1. Hall Flooring Tiles",
        keywords: ["floor", "marble", "tile", "step"],
        fallbackImage: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Italian Marble Finish Glazed Vitrified Tile",
        fallbackPrice: "1250",
      },
      {
        key: "wall_accent",
        title: "2. Feature Wall Cladding",
        keywords: ["wall", "panel", "accent", "cladding"],
        fallbackImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Textured Stone Wall Elevation Panel",
        fallbackPrice: "850",
      },
      {
        key: "door_hardware",
        title: "3. Designer Door Handles & Locks",
        keywords: ["handle", "lock", "hardware", "brass"],
        fallbackImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Antiqued Brass Mortise Door Lock Handle",
        fallbackPrice: "2100",
      },
    ],
  },
  kitchen: {
    label: "Kitchen Suite",
    icon: Utensils,
    description: "Build a modern modular kitchen with stainless steel sinks, pull-out taps, and anti-skid floor tiles.",
    steps: [
      {
        key: "sink",
        title: "1. Stainless Steel Kitchen Sink",
        keywords: ["kitchen", "sink"],
        fallbackImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Double Bowl Stainless Steel Kitchen Sink",
        fallbackPrice: "6499",
      },
      {
        key: "kitchen_tap",
        title: "2. 360° Swivel Kitchen Tap",
        keywords: ["kitchen", "tap", "swivel", "pull-out"],
        fallbackImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
        fallbackName: "360° Flexible Swivel Kitchen Sink Mixer",
        fallbackPrice: "3299",
      },
      {
        key: "backsplash",
        title: "3. Backsplash Tiles",
        keywords: ["tile", "mosaic", "wall"],
        fallbackImage: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=500&auto=format&fit=crop&q=60",
        fallbackName: "High-Gloss Subway Backsplash Tiles",
        fallbackPrice: "720",
      },
    ],
  },
  outdoor: {
    label: "Outdoor & Terrace Suite",
    icon: Trees,
    description: "Upgrade outdoor patios and balconies with anti-skid step-risers, elevation tiles, and weather-proof fittings.",
    steps: [
      {
        key: "step_riser",
        title: "1. Anti-Skid Step & Riser Tiles",
        keywords: ["step", "riser", "tile"],
        fallbackImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Matt Step & Riser Tile (Anti-Skid)",
        fallbackPrice: "450",
      },
      {
        key: "outdoor_wall",
        title: "2. Exterior Elevation Tiles",
        keywords: ["elevation", "exterior", "wall"],
        fallbackImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60",
        fallbackName: "Weather-Proof Weathered Stone Elevation",
        fallbackPrice: "980",
      },
    ],
  },
};

export default function SuiteBuilderPage() {
  const [activeRoom, setActiveRoom] = useState<RoomType>("bathroom");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Record<string, Product>>({});
  const { addItem } = useCart();
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCatalog(data);
      })
      .catch((err) => console.error("Failed to load catalog for suite builder:", err))
      .finally(() => setLoading(false));
  }, []);

  const currentSuite = ROOM_SUITES[activeRoom];

  // Helper to filter products for a step strictly without showing wrong products
  const getProductsForStep = (step: StepConfig): Product[] => {
    if (!catalog.length) return [];

    const matched = catalog.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      
      // Exclude step & riser tiles from wash basins and faucets!
      if (step.key === "basin" || step.key === "faucet" || step.key === "shower" || step.key === "toilet") {
        if (name.includes("step") || name.includes("riser") || cat.includes("step")) return false;
      }

      return step.keywords.some((kw) => name.includes(kw) || cat.includes(kw));
    });

    if (matched.length > 0) return matched;

    // Fallback item so step is never empty or showing wrong products
    return [
      {
        id: `mock-${step.key}`,
        name: step.fallbackName,
        price: step.fallbackPrice,
        image: step.fallbackImage,
        category: currentSuite.label,
      },
    ];
  };

  const totalSuitePrice = Object.values(selectedItems).reduce((sum, item) => {
    if (!item) return sum;
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(priceNum) ? 0 : priceNum);
  }, 0);

  const selectedCount = Object.keys(selectedItems).length;

  const handleAddSuiteToCart = () => {
    Object.values(selectedItems).forEach((item) => {
      if (item) {
        addItem({
          productId: item.id,
          name: item.name,
          price: parseFloat(item.price.replace(/[^0-9.]/g, "")),
          image: item.image,
          quantity: 1,
        });
      }
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 dark:text-stone-200">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Hero */}
        <div className="rounded-[32px] border border-[#e2d5c3] bg-white p-8 sm:p-12 shadow-xl dark:border-[#382f25] dark:bg-[#1a1613] text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-stone-100 dark:bg-stone-800 text-[#b49663] dark:text-[#c5a059]">
            <Sparkles className="h-4 w-4" /> Interactive Suite Builder
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
            Home & Project Suite Builder
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Select room type (Bathroom, Hall, Kitchen, Outdoor) and choose matching fixtures to auto-calculate total package pricing with 1-click suite cart checkout.
          </p>

          {/* Room Selection Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {(Object.keys(ROOM_SUITES) as RoomType[]).map((key) => {
              const suite = ROOM_SUITES[key];
              const Icon = suite.icon;
              const isActive = activeRoom === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveRoom(key);
                    setSelectedItems({});
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition shadow-sm ${
                    isActive
                      ? "bg-[#b49663] text-white shadow-md"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{suite.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Package Summary Bar */}
        <div className="sticky top-4 z-40 rounded-2xl border border-stone-200 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-4 shadow-xl dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              {Object.values(selectedItems).map((item, i) => (
                <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-stone-900 overflow-hidden relative bg-stone-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">
                {selectedCount} of {currentSuite.steps.length} {currentSuite.label} Items Selected
              </p>
              <p className="text-xs text-stone-500">{currentSuite.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase">Suite Package Total</span>
              <span className="text-xl font-extrabold text-[#b49663] dark:text-[#c5a059]">
                ₹{totalSuitePrice.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handleAddSuiteToCart}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 rounded-2xl bg-[#c5a059] px-6 py-3 text-xs font-extrabold text-stone-900 shadow hover:bg-[#b49663] transition disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              <span>{addedSuccess ? "Added Suite to Cart! ✓" : "Add Entire Suite to Cart"}</span>
            </button>
          </div>
        </div>

        {/* Steps & Product Selector */}
        <div className="space-y-8">
          {currentSuite.steps.map((step) => {
            const stepProducts = getProductsForStep(step);

            return (
              <div
                key={step.key}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h2 className="font-bold text-base text-stone-900 dark:text-white font-serif">
                    {step.title}
                  </h2>
                  <span className="text-xs text-[#b49663] dark:text-[#c5a059] font-bold">
                    {selectedItems[step.key] ? "✓ Item Selected" : "Select an item below"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stepProducts.map((prod) => {
                    const isSelected = selectedItems[step.key]?.id === prod.id;
                    return (
                      <div
                        key={prod.id}
                        onClick={() =>
                          setSelectedItems({
                            ...selectedItems,
                            [step.key]: isSelected ? null as any : prod,
                          })
                        }
                        className={`cursor-pointer rounded-2xl border p-3 transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? "border-[#b49663] bg-stone-50 dark:bg-stone-950 ring-2 ring-[#b49663]"
                            : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#b49663] text-white text-xs font-bold shadow">
                            ✓
                          </span>
                        )}

                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-950 mb-2">
                          <Image src={prod.image} alt={prod.name} fill unoptimized={prod.image.startsWith("http")} className="object-cover" />
                        </div>

                        <div>
                          <p className="font-bold text-xs text-stone-900 dark:text-white line-clamp-2">
                            {prod.name}
                          </p>
                          <p className="mt-1 text-xs font-extrabold text-[#b49663] dark:text-[#c5a059]">
                            ₹{Number(prod.price).toLocaleString("en-IN")}
                          </p>

                          <button
                            type="button"
                            className={`mt-2.5 w-full py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                              isSelected
                                ? "bg-[#b49663] text-white shadow"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#b49663] hover:text-white"
                            }`}
                          >
                            <span>{isSelected ? "✓ Selected" : "+ Select for Suite"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
