"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  stock: number;
  price: string;
}

export default function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLowStock() {
      try {
        const res = await fetch("/api/admin/insights");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.lowStock)) {
          setProducts(data.lowStock);
        }
      } catch (error) {
        console.error("Failed to load low stock products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLowStock();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Low Stock Alert
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Products with inventory under 10 units
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Checking inventory…</p>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <CheckCircle size={18} />
            <span>All catalog products are well stocked!</span>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-4 transition-all duration-200 hover:bg-amber-100/70 dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
                  Only {product.stock} left in stock
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                <Link
                  href="/admin/products"
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
                >
                  Restock
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}