"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  customerName: string;
  items: string;
  total: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled" | "Pending" | "Confirmed";
  date: string;
}

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Confirmed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const recentOrders = data.slice(0, 5).map((order: any) => ({
            id: `#${order.id.slice(0, 8)}`,
            customerName: order.customerName,
            items: "Multiple items",
            total: `₹${Number(order.total).toFixed(2)}`,
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1) as Order["status"],
            date: new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }));
          setOrders(recentOrders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last 5 orders
            </p>
          </div>
        </div>
        <div className="mt-6 animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Orders
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last 5 orders
        </p>
      </div>
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No orders yet
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Order ID
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Customer
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Items
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Total
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-700/30"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {order.total}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.status] || ""}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {order.date}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                      View
                    </button>
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