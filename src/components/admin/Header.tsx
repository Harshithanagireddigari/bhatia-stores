"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Bell, User, Sun, Moon, Check, ShoppingBag, RotateCcw, FileText, ExternalLink, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "order_placed" | "return_request" | "boq_quote" | string;
  title: string;
  message: string;
  link?: string | null;
  isRead: number;
  createdAt: string;
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "returns" | "quotes">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotificationsList(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching admin notifications:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s for new alerts
    return () => clearInterval(interval);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id?: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : {}),
      });
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filteredNotifications = notificationsList.filter((n) => {
    if (activeTab === "orders") return n.type === "order_placed";
    if (activeTab === "returns") return n.type === "return_request";
    if (activeTab === "quotes") return n.type === "boq_quote";
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 dark:border-gray-800 dark:bg-gray-900 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search store..."
              className="w-64 rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}

          {/* Interactive Live Notifications Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
              aria-label="Admin Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Popover Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-50 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Store Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => handleMarkAsRead()}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Section Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold px-2 pt-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1.5 border-b-2 transition ${
                      activeTab === "all"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    All ({notificationsList.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`px-3 py-1.5 border-b-2 transition ${
                      activeTab === "orders"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("returns")}
                    className={`px-3 py-1.5 border-b-2 transition ${
                      activeTab === "returns"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    Returns
                  </button>
                  <button
                    onClick={() => setActiveTab("quotes")}
                    className={`px-3 py-1.5 border-b-2 transition ${
                      activeTab === "quotes"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    BOQ Quotes
                  </button>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-500">
                      No notifications in this section.
                    </div>
                  ) : (
                    filteredNotifications.map((item) => {
                      const isUnread = item.isRead === 0;

                      let Icon = Bell;
                      let iconColor = "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40";
                      if (item.type === "order_placed") {
                        Icon = ShoppingBag;
                        iconColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40";
                      } else if (item.type === "return_request") {
                        Icon = RotateCcw;
                        iconColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/40";
                      } else if (item.type === "boq_quote") {
                        Icon = FileText;
                        iconColor = "text-purple-600 bg-purple-50 dark:bg-purple-950/40";
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isUnread) handleMarkAsRead(item.id);
                          }}
                          className={`p-3.5 flex items-start gap-3 transition ${
                            isUnread
                              ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                            <Icon size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {item.title}
                              </h4>
                              {isUnread && (
                                <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug line-clamp-2">
                              {item.message}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1">
                              <span className="text-[10px] text-gray-400">
                                {new Date(item.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {item.link && (
                                <Link
                                  href={item.type === "boq_quote" ? "/admin/messages?tab=quotes" : item.link}
                                  onClick={() => setShowNotifications(false)}
                                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  <span>View Section</span>
                                  <ExternalLink size={11} />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer link */}
                <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center border-t border-gray-100 dark:border-gray-800">
                  <Link
                    href="/admin/messages"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All Messages & Customer Inquiries →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}