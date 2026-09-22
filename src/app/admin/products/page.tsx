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
    category: "Electronics",
    stock: "10",
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
    setForm({ name: "", description: "", price: "", image: "", category: "Electronics", stock: "10" });
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
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Product updated!");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Product created!");
      }
      resetForm();
      fetchProducts();
    } catch {
      toast.error("Failed to save product");
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
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6">
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

          {/* Products Table */}
          <div className="overflow-x-auto">
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
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-2xl">🛒</span>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </span>
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
