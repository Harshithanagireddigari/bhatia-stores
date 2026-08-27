"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  Star,
  Check,
  Eye,
  ArrowUpDown,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

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
  isPopular?: number;
}

const CATEGORIES = [
  "Vitrified Floor Tiles",
  "Digital Wall Tiles",
  "Double Charge",
  "Satin Matt",
  "Step & Riser",
  "Sanitaryware & Faucets",
];

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const autoNew = searchParams.get("action") === "new";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;
    image: string;
    images: string[];
    category: string;
    stock: string;
    dimensions: string;
    finish: string;
    material: string;
    rating: string;
    featured: boolean;
    isPopular: boolean;
  }>({
    name: "",
    description: "",
    price: "",
    image: "",
    images: [],
    category: "Vitrified Floor Tiles",
    stock: "50",
    dimensions: "600 x 1200 mm",
    finish: "High Gloss Polished (PGVT)",
    material: "Glazed Vitrified Porcelain",
    rating: "4.8",
    featured: false,
    isPopular: false,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (autoNew) {
      startNewProduct();
    }
  }, [autoNew]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function startNewProduct() {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: "",
      image: "",
      images: [],
      category: "Vitrified Floor Tiles",
      stock: "50",
      dimensions: "600 x 1200 mm",
      finish: "High Gloss Polished (PGVT)",
      material: "Glazed Vitrified Porcelain",
      rating: "4.8",
      featured: false,
      isPopular: false,
    });
    setShowModal(true);
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    const imgList = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      images: imgList,
      category: product.category,
      stock: String(product.stock),
      dimensions: product.dimensions || "",
      finish: product.finish || "",
      material: product.material || "",
      rating: product.rating || "4.8",
      featured: product.featured === 1,
      isPopular: product.isPopular === 1,
    });
    setShowModal(true);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("Uploading image through dedicated storage server...");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setForm((prev) => {
        const newImages = [...prev.images, data.imageUrl];
        return {
          ...prev,
          image: prev.image || data.imageUrl,
          images: newImages,
        };
      });

      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.", { id: toastId });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (imgUrl: string) => {
    setForm((prev) => {
      const remaining = prev.images.filter((img) => img !== imgUrl);
      return {
        ...prev,
        image: prev.image === imgUrl ? (remaining[0] || "") : prev.image,
        images: remaining,
      };
    });
  };

  const setAsPrimary = (imgUrl: string) => {
    setForm((prev) => ({
      ...prev,
      image: imgUrl,
    }));
    toast.info("Set as primary thumbnail.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill in required fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        image: form.image || form.images[0] || "/products/new-stock/pgvt-01.jpg",
        images: form.images.length > 0 ? form.images : [form.image || "/products/new-stock/pgvt-01.jpg"],
        category: form.category,
        stock: form.stock,
        dimensions: form.dimensions,
        finish: form.finish,
        material: form.material,
        rating: form.rating,
        featured: form.featured,
        isPopular: form.isPopular,
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success(`Updated "${form.name}"!`);
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success(`Created "${form.name}"!`);
      }

      setShowModal(false);
      fetchProducts();
    } catch {
      toast.error("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deleted.");
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      toast.error("Could not delete product.");
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === "All" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchQuery = search.trim() === "" || `${p.name} ${p.category} ${p.finish || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Inventory & Catalog
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Manage Products ({products.length})
            </h1>
          </div>

          <button
            onClick={startNewProduct}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-purple-800 transition"
          >
            <Plus size={15} />
            <span>+ Add New Product</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, finish, category..."
              className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  categoryFilter === cat
                    ? "bg-stone-900 text-white dark:bg-amber-600"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">No matching products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400">
                    <th className="py-3.5 px-4 sm:px-6">Surface / Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price / Box</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Finish / Dimensions</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || "/products/new-stock/pgvt-01.jpg"}
                            alt={p.name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-stone-900 dark:text-white truncate">{p.name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500">
                              <span>★ {p.rating || "4.8"}</span>
                              {p.featured === 1 && <span className="text-amber-600 font-bold">• Featured</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                        ₹{Number(p.price).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            p.stock <= 10
                              ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-stone-500">
                        {p.dimensions || "600x600"} • {p.finish || "Gloss"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${p.id}`}
                            target="_blank"
                            className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white"
                            title="Preview customer product page"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1.5 text-purple-900 hover:text-purple-700 dark:text-amber-400"
                            title="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-stone-900 dark:border dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                {editingProduct ? "Edit Product Details" : "Create New Tile Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Name & Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. PGVT Statuario White 600x1200"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Price per Box (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    placeholder="1350.00"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Available Stock (Boxes) *
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    placeholder="50"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    placeholder="600 x 1200 mm"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Surface Finish
                  </label>
                  <input
                    type="text"
                    value={form.finish}
                    onChange={(e) => setForm({ ...form, finish: e.target.value })}
                    placeholder="High Gloss Polished"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Body Material
                  </label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    placeholder="Glazed Porcelain"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Description & Surface Highlights
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed material description, design inspiration, and installation guidelines..."
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              {/* Dedicated Image Storage Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Product Images (Dedicated Image Storage Server)
                </label>

                <div className="mt-2 flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    <Upload size={14} />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {/* Uploaded Images List & Thumbnails */}
                {form.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {form.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 bg-stone-100 dark:bg-stone-800 ${
                          form.image === img ? "border-amber-600 shadow-sm" : "border-stone-200 dark:border-stone-700"
                        }`}
                      >
                        <img src={img} alt={`Preview ${idx + 1}`} className="h-20 w-full object-cover" />

                        {form.image === img && (
                          <span className="absolute left-1 top-1 rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            Primary
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {form.image !== img && (
                            <button
                              type="button"
                              onClick={() => setAsPrimary(img)}
                              className="rounded bg-white/90 p-1 text-[10px] text-stone-900 font-bold hover:bg-white"
                              title="Set as primary thumbnail"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(img)}
                            className="rounded bg-red-600 p-1 text-white hover:bg-red-700"
                            title="Remove image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Badges Toggles */}
              <div className="flex flex-wrap gap-6 border-t border-stone-100 pt-3 dark:border-stone-800">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded text-purple-900"
                  />
                  <span>Featured Release on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                    className="rounded text-purple-900"
                  />
                  <span>Popular Best-Selling Surface</span>
                </label>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-xl bg-purple-900 px-6 py-2 text-xs font-semibold text-white hover:bg-purple-800 transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? "Saving Product..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
