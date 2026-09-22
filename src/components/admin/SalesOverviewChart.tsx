"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesData = [
  { day: "Mon", sales: 12000 },
  { day: "Tue", sales: 19000 },
  { day: "Wed", sales: 15000 },
  { day: "Thu", sales: 22000 },
  { day: "Fri", sales: 28000 },
  { day: "Sat", sales: 35000 },
  { day: "Sun", sales: 32000 },
];

export default function SalesOverviewChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Sales Overview
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Last 7 days
      </p>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="day" 
              className="text-sm text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-sm text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, "Sales"]}
            />
            <Bar 
              dataKey="sales" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
              className="fill-indigo-600"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
