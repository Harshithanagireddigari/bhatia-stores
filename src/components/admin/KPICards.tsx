"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, IndianRupee, Package, Users } from "lucide-react";

interface KPICard {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export default function KPICards() {
  const [kpiData, setKpiData] = useState<KPICard[]>([
    {
      title: "Total Orders",
      value: "Loading...",
      icon: <ShoppingBag className="h-6 w-6" />,
    },
    {
      title: "Total Revenue",
      value: "Loading...",
      icon: <IndianRupee className="h-6 w-6" />,
    },
    {
      title: "Total Products",
      value: "Loading...",
      icon: <Package className="h-6 w-6" />,
    },
    {
      title: "Total Customers",
      value: "Loading...",
      icon: <Users className="h-6 w-6" />,
    },
  ]);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const res = await fetch("/api/admin/insights");
        if (!res.ok) return;
        const insights = await res.json();

        const totalOrders = insights.totalOrders || 0;
        const totalProducts = insights.totalProducts || 0;
        const totalCustomers = insights.totalCustomers || 0;
        const totalRevenue = insights.totalRevenue || 0;

        setKpiData([
          {
            title: "Total Orders",
            value: totalOrders.toLocaleString("en-IN"),
            icon: <ShoppingBag className="h-6 w-6" />,
          },
          {
            title: "Total Revenue",
            value: `₹${Number(totalRevenue).toLocaleString("en-IN")}`,
            icon: <IndianRupee className="h-6 w-6" />,
          },
          {
            title: "Total Products",
            value: totalProducts.toLocaleString("en-IN"),
            icon: <Package className="h-6 w-6" />,
          },
          {
            title: "Total Customers",
            value: totalCustomers.toLocaleString("en-IN"),
            icon: <Users className="h-6 w-6" />,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch KPI data:", error);
      }
    }

    fetchKPIs();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {kpi.icon}
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Live
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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