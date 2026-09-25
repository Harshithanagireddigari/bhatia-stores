"use client";

import { useState, useEffect } from "react";
import { RotateCcw, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import Image from "next/image";

interface ReturnItem {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  requestType: "return" | "exchange";
  reason: string;
  details: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  adminComment: string | null;
  createdAt: string;
  deliveredAt: string | null;
  customerName: string;
  customerEmail: string;
  phone: string;
  productName: string;
  productImage: string;
  productPrice: string;
}

export default function AdminReturnsPage() {
  const [returnsList, setReturnsList] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminCommentInput, setAdminCommentInput] = useState<{ [key: string]: string }>({});

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/returns");
      if (res.ok) {
        const data = await res.json();
        setReturnsList(data);
      }
    } catch (err) {
      console.error("Error fetching returns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (returnId: string, status: string) => {
    setUpdatingId(returnId);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId,
          status,
          adminComment: adminCommentInput[returnId] || null,
        }),
      });
      if (res.ok) {
        await fetchReturns();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = returnsList.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            14-Day Returns & Exchanges Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review customer return/exchange requests submitted within 14 days of delivery.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, order ID, or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No return or exchange requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const requestedDate = new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const deliveredDate = item.deliveredAt
              ? new Date(item.deliveredAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "N/A";

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${
                          item.requestType === "exchange"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {item.requestType}
                      </span>

                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                          item.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : item.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : item.status === "completed"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-2">
                      Order #{item.orderId}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Requested on: {requestedDate} | Delivered on: {deliveredDate}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.customerName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.customerEmail} | {item.phone}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.productImage || "/placeholder.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      ₹{parseFloat(item.productPrice).toLocaleString("en-IN")}
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-xs mt-2 border border-gray-100 dark:border-gray-800">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        <span className="font-bold">Reason:</span> {item.reason}
                      </p>
                      {item.details && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-bold">Details:</span> {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Add optional admin comment/reason for approval or rejection..."
                    value={adminCommentInput[item.id] ?? item.adminComment ?? ""}
                    onChange={(e) =>
                      setAdminCommentInput({
                        ...adminCommentInput,
                        [item.id]: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex items-center gap-2">
                    {item.status !== "approved" && item.status !== "completed" && (
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleUpdateStatus(item.id, "approved")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}

                    {item.status !== "rejected" && item.status !== "completed" && (
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleUpdateStatus(item.id, "rejected")}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    )}

                    {item.status === "approved" && (
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleUpdateStatus(item.id, "completed")}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
