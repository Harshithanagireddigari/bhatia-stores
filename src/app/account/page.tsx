"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { toast } from "sonner";
import {
  User,
  Package,
  MapPin,
  Heart,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlist();

  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "orders" | "addresses" | "wishlist" | "security">("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string; phone?: string; role: string; createdAt: string } | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);

  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    apartment: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Security Form state
  const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    async function loadAccountData() {
      setLoading(true);
      try {
        const profileRes = await fetch("/api/auth/profile");
        if (profileRes.status === 401) {
          router.push("/login?redirect=/account");
          return;
        }

        const profileData = await profileRes.json();
        if (profileData?.user) {
          setUser(profileData.user);
          setProfileForm({
            name: profileData.user.name || "",
            phone: profileData.user.phone || "",
          });
        }

        // Fetch Orders
        const ordRes = await fetch("/api/orders");
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(Array.isArray(ordData) ? ordData : []);
        }

        // Fetch Addresses
        const addrRes = await fetch("/api/addresses");
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(Array.isArray(addrData) ? addrData : []);
        }
      } catch (err) {
        console.error("Account load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setUser((prev: any) => ({ ...prev, ...data.user }));
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const endpoint = editingAddressId ? `/api/addresses/${editingAddressId}` : "/api/addresses";
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address");

      toast.success(editingAddressId ? "Address updated!" : "New address added!");
      setShowAddressModal(false);
      setEditingAddressId(null);
      setAddressForm({ name: "", phone: "", street: "", apartment: "", locality: "", city: "", state: "", pincode: "", isDefault: false });

      // Refresh addresses
      const ref = await fetch("/api/addresses");
      if (ref.ok) setAddresses(await ref.json());
    } catch (err: any) {
      toast.error(err.message || "Could not save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this saved address?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success("Address removed.");
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id ? 1 : 0 })));
      toast.success("Default delivery address set!");
    } catch {
      toast.error("Failed to set default address.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(securityForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      toast.success("Password changed successfully!");
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Password update failed.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out successfully.");
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-stone-500">
        <p>Loading your account profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total || 0), 0);
  const defaultAddress = addresses.find((a) => a.isDefault === 1) || addresses[0];

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header with Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-8 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-900 text-2xl font-bold font-serif text-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Customer Dashboard
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                Welcome, {user.name}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {user.email} {user.phone && `• ${user.phone}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full bg-purple-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-purple-800 transition"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-red-50 hover:text-red-600 transition dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Grid Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-3 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <nav className="flex flex-col space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "overview"
                      ? "bg-stone-900 text-white dark:bg-amber-600"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <User size={16} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "orders"
                      ? "bg-stone-900 text-white dark:bg-amber-600"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} />
                    <span>My Orders</span>
                  </div>
                  {orders.length > 0 && (
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "addresses"
                      ? "bg-stone-900 text-white dark:bg-amber-600"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={16} />
                    <span>Saved Addresses</span>
                  </div>
                  {addresses.length > 0 && (
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                      {addresses.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "wishlist"
                      ? "bg-stone-900 text-white dark:bg-amber-600"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlistItems.length > 0 && (
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "profile"
                      ? "bg-stone-900 text-white dark:bg-amber-600"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "security"
                      ? "bg-stone-900 text-white dark:bg-amber-600"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <Lock size={16} />
                  <span>Security & Password</span>
                </button>
              </nav>
            </div>

            {/* Showroom Concierge Card */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Showroom Concierge
              </h4>
              <p className="mt-1 text-xs text-stone-500">Need material guidance or site measurements?</p>
              <a
                href="https://wa.me/919984979720?text=Hello%20Bhatia%20Stores,%20I%20am%20a%20registered%20customer%20and%20need%20assistance."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>

          {/* Main Content Area (9 cols) */}
          <div className="lg:col-span-9">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-xs font-semibold text-stone-500">Total Material Orders</span>
                    <p className="mt-2 font-serif text-3xl font-bold text-stone-900 dark:text-white">
                      {orders.length}
                    </p>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1 block">
                      Lifetime Dispatches
                    </span>
                  </div>

                  <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-xs font-semibold text-stone-500">Total Material Spend</span>
                    <p className="mt-2 font-serif text-3xl font-bold text-purple-900 dark:text-amber-400">
                      ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                      Verified Purchases
                    </span>
                  </div>

                  <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-xs font-semibold text-stone-500">Saved Wishlist Items</span>
                    <p className="mt-2 font-serif text-3xl font-bold text-stone-900 dark:text-white">
                      {wishlistItems.length}
                    </p>
                    <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                      Saved Surfaces & Suites
                    </span>
                  </div>
                </div>

                {/* Recent Order Snapshot */}
                <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                      Recent Order Status
                    </h3>
                    {orders.length > 0 && (
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-semibold text-purple-900 hover:underline dark:text-amber-400"
                      >
                        View All ({orders.length}) →
                      </button>
                    )}
                  </div>

                  {orders.length > 0 ? (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/60 dark:bg-stone-800/50 dark:border-stone-700">
                      <div>
                        <span className="font-mono text-xs font-bold text-stone-900 dark:text-white">
                          #{orders[0].id.slice(0, 8).toUpperCase()}
                        </span>
                        <p className="font-serif text-xl font-bold text-stone-900 dark:text-white mt-1">
                          ₹{parseFloat(orders[0].total).toFixed(2)}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Placed on {new Date(orders[0].createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 capitalize">
                          {orders[0].status}
                        </span>
                        <Link
                          href={`/orders/${orders[0].id}`}
                          className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition"
                        >
                          Track Dispatch
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-stone-500">No orders placed yet. Explore the showroom catalog to order tiles.</p>
                  )}
                </div>

                {/* Default Address Snapshot */}
                <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                      Primary Delivery Address
                    </h3>
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className="text-xs font-semibold text-purple-900 hover:underline dark:text-amber-400"
                    >
                      Manage Addresses →
                    </button>
                  </div>

                  {defaultAddress ? (
                    <div className="mt-4 space-y-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                      <p className="font-bold text-stone-900 dark:text-white">{defaultAddress.name}</p>
                      <p>{defaultAddress.street} {defaultAddress.apartment && `, ${defaultAddress.apartment}`}</p>
                      <p>{defaultAddress.locality} {defaultAddress.city}, {defaultAddress.state} – {defaultAddress.pincode}</p>
                      <p className="text-xs text-stone-500">Phone: {defaultAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-stone-500">No saved addresses. Add a delivery address for one-click checkout.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4 dark:border-stone-800">
                    Order History ({orders.length})
                  </h3>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package size={40} className="mx-auto text-stone-400" />
                      <p className="mt-3 text-xs sm:text-sm text-stone-500">No past orders found.</p>
                      <Link
                        href="/shop"
                        className="mt-4 inline-block rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
                      >
                        Explore Products
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
                      {orders.map((ord) => (
                        <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="font-mono text-xs font-bold text-stone-900 dark:text-white">
                              #{ord.id.slice(0, 8).toUpperCase()}
                            </span>
                            <p className="font-serif text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                              ₹{parseFloat(ord.total).toFixed(2)}
                            </p>
                            <p className="text-xs text-stone-500">
                              {new Date(ord.createdAt).toLocaleDateString()} • {ord.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-800 dark:bg-stone-800 dark:text-stone-300 capitalize">
                              {ord.status}
                            </span>
                            <Link
                              href={`/orders/${ord.id}`}
                              className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition dark:border-stone-700 dark:text-stone-200"
                            >
                              Details & Tracking
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                      Saved Delivery Addresses
                    </h3>
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({ name: user.name, phone: user.phone || "", street: "", apartment: "", locality: "", city: "", state: "", pincode: "", isDefault: false });
                        setShowAddressModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition"
                    >
                      <Plus size={14} />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="py-8 text-center text-xs text-stone-500">No saved addresses. Click &quot;Add New Address&quot; above.</p>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`rounded-2xl border p-5 transition ${
                            addr.isDefault === 1
                              ? "border-amber-600/60 bg-amber-50/40 dark:border-amber-500/40 dark:bg-amber-950/20"
                              : "border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-stone-900 dark:text-white">{addr.name}</span>
                            {addr.isDefault === 1 && (
                              <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {addr.street} {addr.apartment && `, ${addr.apartment}`}<br />
                            {addr.locality && `${addr.locality}, `}{addr.city}, {addr.state} – {addr.pincode}
                          </p>
                          <p className="mt-2 text-xs text-stone-500">Phone: {addr.phone}</p>

                          <div className="mt-4 flex items-center gap-2 border-t border-stone-200/60 pt-3 dark:border-stone-700 text-xs">
                            {addr.isDefault !== 1 && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-purple-900 font-semibold hover:underline dark:text-amber-400"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingAddressId(addr.id);
                                setAddressForm({
                                  name: addr.name,
                                  phone: addr.phone,
                                  street: addr.street,
                                  apartment: addr.apartment || "",
                                  locality: addr.locality || "",
                                  city: addr.city,
                                  state: addr.state,
                                  pincode: addr.pincode,
                                  isDefault: addr.isDefault === 1,
                                });
                                setShowAddressModal(true);
                              }}
                              className="text-stone-600 hover:text-stone-900 font-medium ml-auto"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4 dark:border-stone-800">
                    Saved Products ({wishlistItems.length})
                  </h3>

                  {wishlistItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <Heart size={40} className="mx-auto text-stone-400" />
                      <p className="mt-3 text-xs sm:text-sm text-stone-500">Your wishlist is empty.</p>
                      <Link
                        href="/shop"
                        className="mt-4 inline-block rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-900 transition"
                      >
                        Explore Tile Collections
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistItems.map((item) => (
                        <div
                          key={item.productId}
                          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900"
                        >
                          <div className="aspect-square overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <h4 className="mt-3 text-sm font-semibold text-stone-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="mt-1 font-serif text-base font-bold text-stone-900 dark:text-white">
                            ₹{item.price.toFixed(2)}
                          </p>

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => {
                                addItem({
                                  productId: item.productId,
                                  name: item.name,
                                  price: item.price,
                                  image: item.image,
                                  quantity: 1,
                                });
                                removeWishlistItem(item.productId);
                                toast.success(`Moved "${item.name}" to cart!`);
                              }}
                              className="flex-1 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => {
                                removeWishlistItem(item.productId);
                                toast.info("Item removed from wishlist.");
                              }}
                              className="p-2 text-stone-400 hover:text-red-600 transition"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: PROFILE */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4 dark:border-stone-800">
                  Profile Information
                </h3>

                <form onSubmit={handleUpdateProfile} className="mt-6 max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2.5 text-sm text-stone-500 cursor-not-allowed dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400"
                    />
                    <p className="mt-1 text-[11px] text-stone-400">Account login email cannot be modified.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-xs font-semibold text-white hover:bg-purple-900 transition disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 6: SECURITY */}
            {activeTab === "security" && (
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4 dark:border-stone-800">
                  Security & Password Update
                </h3>

                <form onSubmit={handleChangePassword} className="mt-6 max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      required
                      placeholder="Minimum 6 characters"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-xs font-semibold text-white hover:bg-purple-900 transition disabled:opacity-50"
                  >
                    {savingPassword ? "Updating Password..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-stone-900 dark:border dark:border-stone-800">
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
              {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
            </h3>

            <form onSubmit={handleSaveAddress} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Street / Plot / Building *
                </label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Apartment / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.apartment}
                    onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded text-purple-900"
                />
                <span>Set this as my default delivery address</span>
              </label>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="rounded-xl bg-stone-900 px-6 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
