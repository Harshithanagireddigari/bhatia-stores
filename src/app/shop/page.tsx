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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-sans">
      {/* Top Title & Quick BOQ Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#b49663] text-[#b49663] dark:text-[#c5a059] text-xs font-bold hover:bg-[#b49663] hover:text-white transition"
          >
            <span>Request BOQ Quote 📄</span>
          </a>
        </div>
      </div>

      {/* Main Layout Grid (Filter Sidebar + Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <h2 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#b49663]" />
              Filter Products
            </h2>
            <button
              onClick={resetAllFilters}
              className="text-[11px] font-bold text-[#b49663] hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name === "All" ? "" : cat.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    (cat.name === "All" && !category) || category === cat.name
                      ? "bg-[#b49663] text-white font-bold"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="opacity-70 text-[10px]">{cat.productCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Finish / Color Filter */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Finish & Coating
            </h3>
            <select
              value={selectedFinish}
              onChange={(e) => setSelectedFinish(e.target.value)}
              className="w-full p-2 text-xs border border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white"
            >
              <option value="All">All Finishes</option>
              <option value="Chrome">Chrome Polish</option>
              <option value="Matt Black">Matt Black</option>
              <option value="Brushed Gold">Brushed Gold</option>
              <option value="Rose Gold">Rose Gold</option>
              <option value="Antique Brass">Antique Brass</option>
            </select>
          </div>

          {/* Mount Type */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Mounting Style
            </h3>
            <select
              value={selectedMount}
              onChange={(e) => setSelectedMount(e.target.value)}
              className="w-full p-2 text-xs border border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white"
            >
              <option value="All">All Mount Types</option>
              <option value="Wall Mount">Wall Mount</option>
              <option value="Table Top">Table Top / Countertop</option>
              <option value="Floor Mounted">Floor Mounted</option>
              <option value="Concealed">Concealed / In-Wall</option>
            </select>
          </div>

          {/* Feature Toggles */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Special Technology
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={waterSavingOnly}
                  onChange={(e) => setWaterSavingOnly(e.target.checked)}
                  className="rounded text-[#b49663] focus:ring-[#b49663]"
                />
                <span className="flex items-center gap-1">💧 Water Saving Aerator</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={antiRustOnly}
                  onChange={(e) => setAntiRustOnly(e.target.checked)}
                  className="rounded text-[#b49663] focus:ring-[#b49663]"
                />
                <span className="flex items-center gap-1">🛡️ Anti-Rust Brass</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={sensorOnly}
                  onChange={(e) => setSensorOnly(e.target.checked)}
                  className="rounded text-[#b49663] focus:ring-[#b49663]"
                />
                <span className="flex items-center gap-1">✨ Touchless Sensor</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Catalog Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <form onSubmit={submitSearch} className="relative w-full sm:max-w-md">
              <Search
                aria-hidden
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                key={search}
                name="search"
                defaultValue={search}
                placeholder="Search taps, showers, basins, finishes..."
                className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-10 text-xs outline-none transition focus:border-[#b49663] dark:border-stone-800 dark:bg-stone-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() =>
                    router.replace(category ? `/shop?category=${encodeURIComponent(category)}` : "/shop")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-white"
            >
              <Filter size={15} />
              <span>Filters</span>
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="mt-16 text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const isCompared = compareList.some((p) => p.id === product.id);
                return (
                  <div key={product.id} className="relative group">
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
      </div>

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
