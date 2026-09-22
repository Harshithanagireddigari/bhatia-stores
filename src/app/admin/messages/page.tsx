"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminMessagesPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and respond to customer messages
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              Messages functionality coming soon.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}