"use client";

import { useEffect, useState, use } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { MessageSquare, ShoppingBag, RotateCcw, FileText, CheckCircle, ExternalLink, Phone, MessageCircle, Download, User, MapPin, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getWhatsAppUrl, formatBOQQuoteWhatsAppMessage } from "@/lib/whatsapp-sms";

interface BOQQuote {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  city: string;
  estimatedBudget: string | null;
  notes: string | null;
  fileUrl: string | null;
  status: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "quotes" | "returns" | "orders") || "quotes";
  const [activeTab, setActiveTab] = useState<"quotes" | "returns" | "orders">(initialTab);

  const [boqList, setBoqList] = useState<BOQQuote[]>([]);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [boqRes, returnsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/boq"),
        fetch("/api/admin/returns"),
        fetch("/api/orders"),
      ]);

      if (boqRes.ok) {
        const boqs = await boqRes.json();
        setBoqList(Array.isArray(boqs) ? boqs : []);
      }
      if (returnsRes.ok) {
        const rets = await returnsRes.json();
        setReturnsList(Array.isArray(rets) ? rets : []);
      }
      if (ordersRes.ok) {
        const ords = await ordersRes.json();
        setOrdersList(Array.isArray(ords) ? ords : []);
      }
    } catch (err) {
      console.error("Failed to load admin inbox data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBoqStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/boq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed to update quote status:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Customer Submissions & Quotation Inbox
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review submitted project BOQ quotes, 14-day return/exchange requests, and order notifications.
              </p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm gap-2">
            <button
              onClick={() => setActiveTab("quotes")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === "quotes"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FileText size={16} />
              <span>BOQ Quote Submissions ({boqList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === "returns"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <RotateCcw size={16} />
              <span>Return & Exchange Requests ({returnsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === "orders"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <ShoppingBag size={16} />
              <span>Customer Orders ({ordersList.length})</span>
            </button>
          </div>

          {/* Section Contents */}
          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
              <p className="mt-2 text-xs text-gray-500">Loading customer requests...</p>
            </div>
          ) : activeTab === "quotes" ? (
            <div className="space-y-4">
              {boqList.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                  No BOQ quote submissions received yet.
                </div>
              ) : (
                boqList.map((quote) => {
                  const isExpanded = expandedQuoteId === quote.id;
                  const whatsappUrl = getWhatsAppUrl(
                    quote.phone,
                    formatBOQQuoteWhatsAppMessage({
                      name: quote.name,
                      phone: quote.phone,
                      projectType: quote.projectType,
                      city: quote.city,
                      estimatedBudget: quote.estimatedBudget,
                      notes: quote.notes,
                    })
                  );

                  return (
                    <div
                      key={quote.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all"
                    >
                      {/* Quote Summary Header */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                              {quote.projectType}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                quote.status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {quote.status}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-gray-900 dark:text-white mt-1.5 flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-600" />
                            {quote.name}
                          </h3>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-3">
                            <span>📧 {quote.email}</span>
                            <span>📞 {quote.phone}</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {quote.city}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            <MessageCircle size={15} />
                            <span>Reply on WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${quote.phone}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 text-xs font-bold transition"
                          >
                            <Phone size={14} />
                            <span>Call</span>
                          </a>

                          <button
                            onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Submitted Quote Details Panel */}
                      <div className="p-5 bg-gray-50/50 dark:bg-gray-900/30 space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          <div>
                            <span className="text-gray-400 block font-medium">Estimated Budget Range</span>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {quote.estimatedBudget || "Not specified"}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block font-medium">Submitted On</span>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {new Date(quote.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block font-medium">BOQ File / Plan Link</span>
                            {quote.fileUrl ? (
                              <a
                                href={quote.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <ExternalLink size={13} />
                                <span>Open Project Document</span>
                              </a>
                            ) : (
                              <span className="text-gray-500 font-medium">No file attached</span>
                            )}
                          </div>
                        </div>

                        {/* Customer Project Notes */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                          <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider text-[10px]">
                            Customer Requirements & Project Notes
                          </span>
                          <p className="text-gray-800 dark:text-gray-200 text-xs leading-relaxed">
                            {quote.notes || "No additional notes provided by customer."}
                          </p>
                        </div>

                        {/* Admin Action Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">Mark Status:</span>
                            <button
                              onClick={() => handleUpdateBoqStatus(quote.id, "quoted")}
                              className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg font-bold hover:bg-emerald-200 transition"
                            >
                              ✓ Quoted
                            </button>
                            <button
                              onClick={() => handleUpdateBoqStatus(quote.id, "closed")}
                              className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg font-bold hover:bg-gray-300 transition"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === "returns" ? (
            <div className="space-y-4">
              {returnsList.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                  No return or exchange requests submitted yet.
                </div>
              ) : (
                returnsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {item.requestType} ({item.status})
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Order #{item.orderId}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-bold">Customer:</span> {item.customerName} ({item.customerEmail}, {item.phone})
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-bold">Reason:</span> {item.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppUrl(item.phone, `Hi ${item.customerName}, regarding your return request for order #${item.orderId.slice(0, 8)}...`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </a>
                      <Link
                        href="/admin/returns"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Manage Return →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {ordersList.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                  No orders placed yet.
                </div>
              ) : (
                ordersList.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        {order.customerName} ({order.customerEmail} | {order.phone})
                      </p>
                      <p className="text-xs font-bold text-[#b49663] dark:text-[#c5a059] mt-0.5">
                        Total: ₹{Number(order.total).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppUrl(order.phone, `Hi ${order.customerName}, regarding your order #${order.id.slice(0, 8).toUpperCase()} at The Bhatias...`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </a>
                      <Link
                        href="/admin/orders"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        View Order →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}