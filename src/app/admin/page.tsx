"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import KPICards from "@/components/admin/KPICards";
import SalesOverviewChart from "@/components/admin/SalesOverviewChart";
import OrderStatusChart from "@/components/admin/OrderStatusChart";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import TopSellingProducts from "@/components/admin/TopSellingProducts";
import LowStockProducts from "@/components/admin/LowStockProducts";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6">
          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards />
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <SalesOverviewChart />
            <OrderStatusChart />
          </div>

          {/* Recent Orders */}
          <div className="mb-6">
            <RecentOrdersTable />
          </div>

          {/* Products Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopSellingProducts />
            <LowStockProducts />
          </div>
        </main>
      </div>
    </div>
  );
}
