"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const orderStatusData = [
  { name: "Delivered", value: 60, color: "#10b981" },
  { name: "Processing", value: 20, color: "#3b82f6" },
  { name: "Shipped", value: 12, color: "#8b5cf6" },
  { name: "Cancelled", value: 8, color: "#ef4444" },
];

const totalOrders = 248;

export default function OrderStatusChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Order Status
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Total orders: {totalOrders}
      </p>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {orderStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => [`${value ?? 0}%`, "Percentage"]}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
