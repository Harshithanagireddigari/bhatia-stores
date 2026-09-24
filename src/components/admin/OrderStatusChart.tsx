"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type StatusItem = {
  name: string;
  value: number;
  color: string;
};

const COLOR_MAP: Record<string, string> = {
  delivered: "#10b981",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

export default function OrderStatusChart() {
  const [chartData, setChartData] = useState<StatusItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/admin/insights");
        if (!res.ok) return;
        const data = await res.json();
        const counts = data.orderStatusCounts || {};
        const total = data.totalOrders || 0;
        setTotalCount(total);

        const items: StatusItem[] = Object.entries(counts).map(([statusKey, count]) => {
          const capitalized = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
          return {
            name: capitalized,
            value: Number(count),
            color: COLOR_MAP[statusKey] || "#6b7280",
          };
        }).filter((item) => item.value > 0);

        setChartData(items);
      } catch (err) {
        console.error("Failed to load order status chart:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Status Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total orders: {totalCount}
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Real-time
        </span>
      </div>

      <div className="mt-6 h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Loading order status breakdown…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No orders recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value} orders`, "Count"]}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
