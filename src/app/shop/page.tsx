"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ArrowUpDown, Check, RotateCcw } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  dimensions?: string;
  finish?: string;
  material?: string;
  rating?: string;
  featured?: number;
}

const CATEGORIES = [
  "All",
  "Vitrified Floor Tiles",
  "Digital Wall Tiles",
  "Double Charge",
  "Satin Matt",
  "Step & Riser",
  "Sanitaryware & Faucets",
];

const SORT_OPTIONS = [
  { label: "Featured & Best Selling", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating-desc" },
  { label: "Newest Releases", value: "newest" },
  { label: "Name: A to Z", value: "name-asc" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: 999999 },
  { label: "Under ₹800", min: 0, max: 800 },
  { label: "₹800 – ₹1,500", min: 800, max: 1500 },
  { label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { label: "₹3,000 & Above", min: 3000, max: 999999 },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";
  const urlSort = searchParams.get("sort") || "featured";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState(urlSort);
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sync state with URL params when they change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setSearchQuery(searchParams.get("search") || "");
    setSortBy(searchParams.get("sort") || "featured");
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }
        if (sortBy) {
          params.set("sort", sortBy);
        }
        const activeRange = PRICE_RANGES[priceRangeIndex];
        if (activeRange && (activeRange.min > 0 || activeRange.max < 999999)) {
          params.set("minPrice", activeRange.min.toString());
          params.set("maxPrice", activeRange.max.toString());
        }
        if (inStockOnly) {
          params.set("inStock", "true");
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Shop product fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, priceRangeIndex, inStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchQuery });
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams({ category: cat === "All" ? "" : cat });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateUrlParams({ sort: newSort });
  };

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });
    router.replace(params.size ? `/shop?${params.toString()}` : "/shop");
  };

  const resetAllFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("featured");
    setPriceRangeIndex(0);
    setInStockOnly(false);
    router.replace("/shop");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    searchQuery.trim().length > 0 ||
    priceRangeIndex !== 0 ||
    inStockOnly;

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="border-b border-stone-200/80 pb-8 dark:border-stone-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Showroom Catalog
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
            Tiles & Luxury Sanitaryware
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Browse our full range of 600x1200 PGVT glazed vitrified slabs, heavy-duty double-charge floor tiles, digital ceramic wall surfaces, and designer Italian sanitary fixtures.
          </p>
        </div>

        {/* Search & Action Bar */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pattern, tile size, finish, marble style..."
              className="w-full rounded-full border border-stone-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-purple-800 focus:ring-1 focus:ring-purple-800 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  updateUrlParams({ search: "" });
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Sort Dropdown & Filter Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm dark:border-stone-800 dark:bg-stone-900">
              <ArrowUpDown size={15} className="text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-stone-800 font-medium outline-none dark:text-stone-200"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="dark:bg-stone-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition ${
                hasActiveFilters
                  ? "border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                  : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filters {hasActiveFilters && "(Active)"}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:text-red-600 transition dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-red-400"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white shadow-sm dark:bg-amber-600 dark:text-white"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expandable Filter Drawer (Price ranges & In-Stock) */}
        {filterDrawerOpen && (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  Price Range
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPriceRangeIndex(idx)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        priceRangeIndex === idx
                          ? "bg-purple-900 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  Availability
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-purple-900 focus:ring-purple-800"
                  />
                  <span>In-Stock Items Only (Immediate Dispatch)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <p>
            {loading ? "Searching showroom..." : `Showing ${products.length} tile and sanitaryware products`}
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="aspect-4/3 rounded-xl bg-stone-200 dark:bg-stone-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
                <div className="mt-2 h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-stone-300 bg-white/60 p-12 text-center dark:border-stone-800 dark:bg-stone-900/60">
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
              No matching products found
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              We couldn't find any items matching your selected filters or search terms. Try clearing your filters or searching for general terms like "PGVT", "Double Charge", or "Wall Tile".
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-stone-500">
          <p>Loading showroom catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
