"use client";

import { AlertTriangle } from "lucide-react";

interface Product {
  name: string;
  stock: string;
  price: string;
}

const lowStockProducts: Product[] = [
  {
    name: "LED Wall Light",
    stock: "Only 3 left",
    price: "₹1,299",
  },
  {
    name: "Ceramic Sink",
    stock: "Only 5 left",
    price: "₹3,250",
  },
  {
    name: "Shower Head Set",
    stock: "Only 7 left",
    price: "₹1,890",
  },
  {
    name: "Toilet Seat",
    stock: "Only 8 left",
    price: "₹2,450",
  },
];

export default function LowStockProducts() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Low Stock Products
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Items that need restocking
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {lowStockProducts.map((product, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.name}
              </p>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {product.stock}
              </p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}