"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type SalesPoint = {
  day: string;
  date: string;
  sales: number;
  count: number;
};

export default function SalesOverviewChart() {
  const [salesData, setSalesData] = useState<SalesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch("/api/admin/insights");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.dailySales)) {
          setSalesData(data.dailySales);
        }
      } catch (err) {
        console.error("Failed to load daily sales:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time daily sales (Last 7 days)
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Live Data
        </span>
      </div>

      <div className="mt-6 h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Loading sales chart…
          </div>
        ) : salesData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No sales recorded in the past 7 days
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="day" 
                className="text-xs text-gray-600 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs text-gray-600 dark:text-gray-400"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Sales"]}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Bar 
                dataKey="sales" 
                fill="#4f46e5" 
                radius={[6, 6, 0, 0]}
                className="fill-indigo-600 transition-all duration-300 hover:fill-indigo-700"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
