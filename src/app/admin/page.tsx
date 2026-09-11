"use client";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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

  const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Sports", "Beauty"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
         <Link
  href="/"
  className="text-sm text-gray-500 hover:text-indigo-600"
>
  ← Back to Store
</Link>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            Manage Products
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/launchpad"
            className="rounded-full border border-[#d9c69d] px-5 py-2.5 text-sm font-semibold text-[#73511b] transition hover:bg-[#fbf6e9]"
          >
            Launchpad
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            Manage Orders
          </Link>
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
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
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
                {categories.map((c) => (
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
      <div className="mt-8 overflow-x-auto">
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
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                <th className="py-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="py-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                <th className="py-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                <th className="py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-4">
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
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{product.stock}</td>
                  <td className="py-3">
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
        )}
      </div>
    </div>
  );
}
