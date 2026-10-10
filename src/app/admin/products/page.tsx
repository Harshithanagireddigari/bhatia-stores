"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  suiteRoom?: string | null;
  suiteStep?: string | null;
}

type StoreCategory = { id: string; name: string; isVisible: number };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Sanitaryware",
    stock: "10",
    suiteRoom: "",
    suiteStep: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {
      // Keep the product form usable while category data is being migrated.
    }
  }

  function resetForm() {
    setForm({ name: "", description: "", price: "", image: "", category: "Sanitaryware", stock: "10", suiteRoom: "", suiteStep: "" });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
      suiteRoom: product.suiteRoom || "",
      suiteStep: product.suiteStep || "",
    });
    setShowForm(true);
  }

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.loading("Uploading image...", {
        id: "upload",
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setForm((prev) => ({
        ...prev,
        image: data.imageUrl,
      }));

      toast.success("Image uploaded successfully!", {
        id: "upload",
      });
    } catch (error: any) {
      console.error(error);

      toast.error(error?.message || "Image upload failed", {
        id: "upload",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.description || !form.price) {
      toast.error("Name, description, and price are required");
      return;
    }
    setSaving(true);

    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            stock: Number(form.stock) || 0,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product");
        toast.success("Product updated successfully!");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            stock: Number(form.stock) || 0,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");
        toast.success("Product created successfully!");
      }
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deleted!");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  }

  const categoryOptions = Array.from(new Set([
    ...categories.map((category) => category.name),
    ...products.map((product) => product.category),
    form.category,
  ].filter(Boolean)));

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-0 md:ml-0 md:ml-64 flex-1 pb-20 md:pb-0 min-w-0 pb-24 md:pb-8 min-w-0">
        <Header />
        <main className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Products
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add, edit, and remove products from your store
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {showForm ? "Cancel" : "+ Add Product"}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? "Edit Product" : "New Product"}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {form.image && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suite Room Assignment (Suite Builder)</label>
                  <select
                    value={form.suiteRoom}
                    onChange={(e) => setForm({ ...form, suiteRoom: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">None (Standard Product)</option>
                    <option value="bathroom">Bathroom Suite</option>
                    <option value="hall">Living Room & Hall Suite</option>
                    <option value="kitchen">Kitchen Suite</option>
                    <option value="outdoor">Outdoor & Terrace Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suite Step</label>
                  <select
                    value={form.suiteStep}
                    onChange={(e) => setForm({ ...form, suiteStep: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">None</option>
                    <option value="basin">1. Wash Basin</option>
                    <option value="faucet">2. Basin Mixer / Faucet</option>
                    <option value="shower">3. Overhead Rain Shower</option>
                    <option value="toilet">4. Water Closet / Toilet</option>
                    <option value="hall_floor">1. Hall Flooring Tiles</option>
                    <option value="wall_accent">2. Feature Wall Cladding</option>
                    <option value="door_hardware">3. Door Handles & Locks</option>
                    <option value="sink">1. Kitchen Sink</option>
                    <option value="kitchen_tap">2. Kitchen Tap</option>
                    <option value="step_riser">1. Step & Riser Tiles</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-full bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Update Product" : "Create Product"}
              </button>
            </form>
          )}

          {/* Products List */}
          <div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                No products yet. Click &ldquo;Add Product&rdquo; to create one.
              </p>
            ) : (
              <>
                {/* Mobile Cards (Visible on screens < 768px) */}
                <div className="grid gap-3 md:hidden">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/90 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <Link href={`/product/${product.id}`} target="_blank" className="shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-16 w-16 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700 text-xl">
                              🛒
                            </div>
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                            {product.category}
                          </span>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                            {product.name}
                          </h3>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-[#b49663] dark:text-[#c5a059]">
                              ₹{parseFloat(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Stock: <strong className="text-gray-900 dark:text-white">{product.stock}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for mobile */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                        <button
                          onClick={() => startEdit(product)}
                          className="flex-1 rounded-xl bg-indigo-50 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="flex-1 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table (Visible on screens >= 768px) */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                        <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Product</th>
                        <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Category</th>
                        <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Price</th>
                        <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Stock</th>
                        <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/product/${product.id}`}
                                target="_blank"
                                title="Click to view product details"
                                className="relative group shrink-0"
                              >
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-11 w-11 rounded-lg object-cover border border-stone-200 dark:border-stone-700 transition duration-200 group-hover:scale-105 group-hover:border-[#b49663]"
                                  />
                                ) : (
                                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-lg">🛒</span>
                                )}
                              </Link>
                              <Link
                                href={`/product/${product.id}`}
                                target="_blank"
                                title="Click to view product details"
                                className="font-medium text-gray-900 dark:text-white hover:text-[#b49663] dark:hover:text-[#b49663] transition hover:underline"
                              >
                                {product.name}
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.stock}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(product)}
                                className="rounded-lg px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
