"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, RotateCcw, ShieldCheck, Droplet, Sparkles, Scale } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  brand?: string;
  finish?: string;
  mountType?: string;
  material?: string;
  warranty?: string;
  waterSaving?: number;
  antiRust?: number;
  sensorType?: number;
  stock: number;
}

type ShopCategory = { name: string; productCount: number };

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState<string>("");
  const [selectedFinish, setSelectedFinish] = useState<string>("All");
  const [selectedMount, setSelectedMount] = useState<string>("All");
  const [waterSavingOnly, setWaterSavingOnly] = useState<boolean>(false);
  const [antiRustOnly, setAntiRustOnly] = useState<boolean>(false);
  const [sensorOnly, setSensorOnly] = useState<boolean>(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Compare state
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get("search")?.trim() ?? "";

  useEffect(() => {
    async function fetchCategories() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        const storedCategories = categoryResponse.ok ? await categoryResponse.json() : [];
        const catalog = productResponse.ok ? await productResponse.json() : [];
        const categoriesWithCounts =
          Array.isArray(storedCategories) && storedCategories.length
            ? storedCategories.map((item: ShopCategory) => ({
                name: item.name,
                productCount: Number(item.productCount) || 0,
              }))
            : Array.from(
                new Set(
                  Array.isArray(catalog)
                    ? catalog.map((item: Product) => item.category).filter(Boolean)
                    : []
                )
              ).map((name) => ({
                name,
                productCount: catalog.filter((item: Product) => item.category === name).length,
              }));
        setCategories(categoriesWithCounts);
      } catch {
        setCategories([]);
      }
    }
    void fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        if (selectedFinish && selectedFinish !== "All") params.set("finish", selectedFinish);
        if (selectedMount && selectedMount !== "All") params.set("mountType", selectedMount);
        if (waterSavingOnly) params.set("waterSaving", "1");
        if (antiRustOnly) params.set("antiRust", "1");
        if (sensorOnly) params.set("sensorType", "1");
        if (maxPriceFilter) params.set("maxPrice", maxPriceFilter);

        const url = params.size ? `/api/products?${params.toString()}` : "/api/products";
        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    void fetchProducts();
  }, [
    category,
    search,
    selectedFinish,
    selectedMount,
    waterSavingOnly,
    antiRustOnly,
    sensorOnly,
    maxPriceFilter,
  ]);

  const categoryFilters: ShopCategory[] = [{ name: "All", productCount: products.length }, ...categories];

  function toggleCompareProduct(product: Product) {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList(compareList.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 4) {
        alert("You can compare up to 4 products at a time.");
        return;
      }
      setCompareList([...compareList, product]);
    }
  }

  function resetAllFilters() {
    setCategory("");
    setSelectedFinish("All");
    setSelectedMount("All");
    setWaterSavingOnly(false);
    setAntiRustOnly(false);
    setSensorOnly(false);
    setMaxPriceFilter("");
    if (search) router.replace("/shop");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("search") ?? "").trim();
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (category) params.set("category", category);
    router.replace(params.size ? `/shop?${params.toString()}` : "/shop");
  }

  const activeFilterCount = [
    Boolean(category),
    selectedFinish !== "All",
    selectedMount !== "All",
    waterSavingOnly,
    antiRustOnly,
    sensorOnly,
    Boolean(maxPriceFilter),
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 font-sans sm:py-8">
      {/* Top Title & Quick BOQ Banner */}
      <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between md:gap-4">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-stone-900 dark:text-white sm:text-3xl">
            Bathware & Hardware Catalog
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Browse our complete collection of premium brassware, sanitaryware & hardware fittings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#b49663] text-white text-xs font-bold shadow-md hover:bg-[#967b4b] transition"
            >
              <Scale size={15} />
              <span>Compare Selected ({compareList.length})</span>
            </button>
          )}

          <a
            href="/boq"
            className="inline-flex items-center gap-2 rounded-lg border border-[#b49663] px-3 py-2 text-xs font-bold text-[#b49663] transition hover:bg-[#b49663] hover:text-white dark:text-[#c5a059] sm:rounded-full sm:px-4 sm:py-2.5"
          >
            <span>Request BOQ Quote 📄</span>
          </a>
        </div>
      </div>

      {/* Top Filter & Category Control Panel */}
      <div className="mb-8 space-y-4">
        {/* Horizontal Category Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryFilters.map((cat) => {
            const isActive = (cat.name === "All" && !category) || category === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name === "All" ? "" : cat.name)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isActive
                    ? "bg-[#b49663] text-white shadow-md scale-102"
                    : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-[#b49663]"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}
                >
                  {cat.productCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Horizontal Filter Console */}
        <div className="hidden space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 md:block">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={submitSearch} className="relative flex-1">
              <Search
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                key={search}
                name="search"
                defaultValue={search}
                placeholder="Search taps, showers, tiles, finishes..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-9 text-xs outline-none transition focus:border-[#b49663] focus:bg-white dark:border-stone-700 dark:bg-stone-950 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() =>
                    router.replace(category ? `/shop?category=${encodeURIComponent(category)}` : "/shop")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedFinish}
                onChange={(e) => setSelectedFinish(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-[#b49663]"
              >
                <option value="All">All Finishes</option>
                <option value="Chrome">Chrome Polish</option>
                <option value="Matt Black">Matt Black</option>
                <option value="Brushed Gold">Brushed Gold</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="Antique Brass">Antique Brass</option>
              </select>

              <select
                value={selectedMount}
                onChange={(e) => setSelectedMount(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white outline-none focus:border-[#b49663]"
              >
                <option value="All">All Mount Types</option>
                <option value="Wall Mount">Wall Mount</option>
                <option value="Table Top">Table Top / Countertop</option>
                <option value="Floor Mounted">Floor Mounted</option>
                <option value="Concealed">Concealed / In-Wall</option>
              </select>

              {(category || selectedFinish !== "All" || selectedMount !== "All" || waterSavingOnly || antiRustOnly || sensorOnly || search) && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition dark:bg-red-950/40 dark:text-red-300"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Feature Badges Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Features:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 hover:text-[#b49663]">
              <input
                type="checkbox"
                checked={waterSavingOnly}
                onChange={(e) => setWaterSavingOnly(e.target.checked)}
                className="rounded text-[#b49663] focus:ring-[#b49663]"
              />
              <span>💧 Water Saving</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 hover:text-[#b49663]">
              <input
                type="checkbox"
                checked={antiRustOnly}
                onChange={(e) => setAntiRustOnly(e.target.checked)}
                className="rounded text-[#b49663] focus:ring-[#b49663]"
              />
              <span>🛡️ Anti-Rust</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 hover:text-[#b49663]">
              <input
                type="checkbox"
                checked={sensorOnly}
                onChange={(e) => setSensorOnly(e.target.checked)}
                className="rounded text-[#b49663] focus:ring-[#b49663]"
              />
              <span>✨ Touchless Sensor</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setShowFiltersMobile(true)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-stone-800 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-white"
          >
            <Filter size={15} className="text-[#b49663]" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#b49663] px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>
            )}
          </button>
          <button
            onClick={resetAllFilters}
            disabled={activeFilterCount === 0 && !search}
            className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-stone-600 disabled:opacity-40 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Product Catalog */}
      <main className="space-y-6">
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="h-48 rounded-xl bg-stone-200 dark:bg-stone-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
                <div className="mt-2 h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">
              No matching products found. Try changing your filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-full bg-[#b49663] text-white text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const isCompared = compareList.some((p) => p.id === product.id);
              return (
                <div key={product.id} className="relative group flex flex-col justify-between">
                  <ProductCard product={product} />

                  {/* Compare Button Toggle */}
                  <button
                    onClick={() => toggleCompareProduct(product)}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                      isCompared
                        ? "bg-[#b49663] text-white border-[#b49663]"
                        : "bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-[#b49663]"
                    }`}
                  >
                    <Scale size={13} />
                    <span>{isCompared ? "Added to Compare ✓" : "+ Compare"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showFiltersMobile && (
        <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[1px] md:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <button
            className="absolute inset-0 cursor-default"
            aria-label="Close filters"
            onClick={() => setShowFiltersMobile(false)}
          />
          <section className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl dark:bg-stone-900">
            <div className="mx-auto h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-white">Filters</p>
                <p className="mt-0.5 text-[11px] text-stone-500">Narrow the catalog to the right fittings.</p>
              </div>
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#b49663]"
              >
                Clear all
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Finish
                <select
                  value={selectedFinish}
                  onChange={(event) => setSelectedFinish(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm font-medium text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-white"
                >
                  <option value="All">All finishes</option>
                  <option value="Chrome">Chrome Polish</option>
                  <option value="Matt Black">Matt Black</option>
                  <option value="Brushed Gold">Brushed Gold</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Antique Brass">Antique Brass</option>
                </select>
              </label>

              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Mount type
                <select
                  value={selectedMount}
                  onChange={(event) => setSelectedMount(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm font-medium text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-white"
                >
                  <option value="All">All mount types</option>
                  <option value="Wall Mount">Wall Mount</option>
                  <option value="Table Top">Table Top / Countertop</option>
                  <option value="Floor Mounted">Floor Mounted</option>
                  <option value="Concealed">Concealed / In-Wall</option>
                </select>
              </label>

              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Maximum price
                <input
                  type="number"
                  min="0"
                  value={maxPriceFilter}
                  onChange={(event) => setMaxPriceFilter(event.target.value)}
                  placeholder="No maximum"
                  className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-white"
                />
              </label>

              <div className="grid grid-cols-1 gap-2 border-y border-stone-100 py-4 dark:border-stone-800">
                <label className="flex min-h-11 items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>Water-saving products</span>
                  <input type="checkbox" checked={waterSavingOnly} onChange={(event) => setWaterSavingOnly(event.target.checked)} className="h-4 w-4 accent-[#b49663]" />
                </label>
                <label className="flex min-h-11 items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>Anti-rust finish</span>
                  <input type="checkbox" checked={antiRustOnly} onChange={(event) => setAntiRustOnly(event.target.checked)} className="h-4 w-4 accent-[#b49663]" />
                </label>
                <label className="flex min-h-11 items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>Touchless sensor</span>
                  <input type="checkbox" checked={sensorOnly} onChange={(event) => setSensorOnly(event.target.checked)} className="h-4 w-4 accent-[#b49663]" />
                </label>
              </div>
            </div>

            <button
              onClick={() => setShowFiltersMobile(false)}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-[#b49663] text-sm font-bold text-white shadow-lg"
            >
              Apply filters
            </button>
          </section>
        </div>
      )}

      {/* Compare Modal Drawer */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#b49663]" />
                Side-by-Side Product Comparison
              </h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-stone-100 dark:divide-stone-800">
              {compareList.map((prod) => (
                <div key={prod.id} className="pt-4 md:pt-0 md:px-3 space-y-3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800">
                    <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                  </div>

                  <h3 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-2">
                    {prod.name}
                  </h3>

                  <p className="text-sm font-extrabold text-[#b49663] dark:text-[#c5a059]">
                    ₹{Number(prod.price).toLocaleString("en-IN")}
                  </p>

                  <div className="space-y-1 text-[11px] bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300">
                    <p><span className="font-bold">Category:</span> {prod.category}</p>
                    <p><span className="font-bold">Finish:</span> {prod.finish || "Chrome"}</p>
                    <p><span className="font-bold">Mount:</span> {prod.mountType || "Wall Mount"}</p>
                    <p><span className="font-bold">Warranty:</span> {prod.warranty || "10 Years"}</p>
                    <p><span className="font-bold">Water Saving:</span> {prod.waterSaving === 1 ? "Yes 💧" : "Standard"}</p>
                    <p><span className="font-bold">Anti-Rust:</span> {prod.antiRust === 1 ? "Yes 🛡️" : "Standard"}</p>
                  </div>

                  <button
                    onClick={() => toggleCompareProduct(prod)}
                    className="w-full py-1 text-[11px] font-bold text-red-500 hover:underline"
                  >
                    Remove from comparison
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-stone-500">Loading shop catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
