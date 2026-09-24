"use client";

import { useEffect, useState } from "react";

interface TopProduct {
  name: string;
  sold: number;
  totalSales?: number;
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        const res = await fetch("/api/admin/insights");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.topProducts)) {
          setProducts(data.topProducts);
        }
      } catch (error) {
        console.error("Failed to load top selling products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Selling Products
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Based on actual customer purchases
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Live Data
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading top products…</p>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
            No product sales recorded yet. Completed orders will appear here.
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:hover:bg-gray-700/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sold} unit{product.sold === 1 ? "" : "s"} sold
                  </p>
                </div>
              </div>
              {product.totalSales !== undefined && product.totalSales > 0 && (
                <p className="font-semibold text-gray-900 dark:text-white">
                  ₹{Number(product.totalSales).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}