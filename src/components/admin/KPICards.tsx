"use client";

import { ShoppingBag, IndianRupee, Package, Users, TrendingUp, TrendingDown } from "lucide-react";

interface KPICard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const kpiData: KPICard[] = [
  {
    title: "Total Orders",
    value: "248",
    change: 12,
    icon: <ShoppingBag className="h-6 w-6" />,
  },
  {
    title: "Total Revenue",
    value: "₹1,24,560",
    change: 18,
    icon: <IndianRupee className="h-6 w-6" />,
  },
  {
    title: "Total Products",
    value: "356",
    change: 5,
    icon: <Package className="h-6 w-6" />,
  },
  {
    title: "Total Customers",
    value: "892",
    change: 14,
    icon: <Users className="h-6 w-6" />,
  },
];

export default function KPICards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {kpi.icon}
            </div>
            <div className="flex items-center gap-1">
              {kpi.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  kpi.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {kpi.change >= 0 ? "+" : ""}
                {kpi.change}%
              </span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {kpi.title}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {kpi.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}