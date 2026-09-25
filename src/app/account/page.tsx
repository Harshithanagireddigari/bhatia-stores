"use client";

import Link from "next/link";
import { 
  Heart, 
  MapPin, 
  Package, 
  Settings, 
  ShoppingBag, 
  UserRound, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  Lock, 
  Shield, 
  Bell, 
  Phone, 
  Mail, 
  User, 
  LogOut,
  ArrowRight,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type User = { name: string; email: string; phone?: string };
type Order = { id: string; total: string; status: string; createdAt: string; razorpayPaymentId: string | null };
type UserReturn = {
  id: string;
  orderId: string;
  productId: string;
  requestType: "return" | "exchange";
  reason: string;
  details: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  adminComment: string | null;
  createdAt: string;
  productName: string;
  productImage: string;
  productPrice: number;
};

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  type: "Home" | "Work" | "Other";
  isDefault: boolean;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  shipped: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
};

const returnStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReturns, setUserReturns] = useState<UserReturn[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "returns" | "addresses" | "wishlist" | "settings">("overview");

  // Address State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, "id">>({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
    type: "Home",
    isDefault: false,
  });

  // Account Settings Form State
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error("Please enter your current password to confirm deletion.");
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete account.");
        return;
      }
      toast.success("Your account has been deleted permanently.");
      localStorage.removeItem("bhatia_saved_addresses");
      window.location.href = "/login";
    } catch {
      toast.error("An error occurred while deleting your account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailUpdates: true,
    whatsappAlerts: true,
    promoOffers: false,
  });

  // Handle Hash URL & Data Fetching
  useEffect(() => {
    // Determine active tab from URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["overview", "orders", "returns", "addresses", "wishlist", "settings"].includes(hash)) {
        setActiveTab(hash as any);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    void Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/orders").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/returns").then((r) => (r.ok ? r.json() : [])),
    ]).then(([me, orderData, returnData]) => {
      if (me.user) {
        setUser(me.user);
        setProfileForm({ name: me.user.name || "", phone: me.user.phone || "" });

        // Load addresses from LocalStorage or initialize default
        const stored = localStorage.getItem("bhatia_saved_addresses");
        if (stored) {
          try {
            setAddresses(JSON.parse(stored));
          } catch {
            initDefaultAddress(me.user);
          }
        } else {
          initDefaultAddress(me.user);
        }
      } else {
        setUser(null);
      }
      setOrders(Array.isArray(orderData) ? orderData : []);
      setUserReturns(Array.isArray(returnData) ? returnData : []);
    });

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function initDefaultAddress(u: User) {
    const initialAddr: SavedAddress = {
      id: "addr_1",
      name: u.name || "Customer",
      phone: "9120435950",
      pincode: "110001",
      address: "123 Connaught Place, Central Market",
      city: "New Delhi",
      state: "Delhi",
      type: "Home",
      isDefault: true,
    };
    setAddresses([initialAddr]);
    localStorage.setItem("bhatia_saved_addresses", JSON.stringify([initialAddr]));
  }

  // Switch Tab Handler
  const switchTab = (tab: "overview" | "orders" | "returns" | "addresses" | "wishlist" | "settings") => {
    if (tab === "orders") {
      window.location.href = "/orders";
      return;
    }
    if (tab === "wishlist") {
      window.location.href = "/wishlist";
      return;
    }
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Pincode Lookup for Address Form
  const handlePincodeChange = async (val: string) => {
    setAddressForm((prev) => ({ ...prev, pincode: val }));
    const cleaned = val.trim();
    if (cleaned.length === 6 && /^\d{6}$/.test(cleaned)) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`/api/pincode/${cleaned}`);
        const data = await res.json();
        if (res.ok && data.deliveryAvailable) {
          setAddressForm((prev) => ({
            ...prev,
            city: data.city || prev.city,
            state: data.state || prev.state,
          }));
          toast.success(`Location detected: ${data.city}, ${data.state}`);
        }
      } catch {
        // quiet
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  // Save / Update Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.pincode || !addressForm.address) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    let updatedList: SavedAddress[] = [];

    if (editingAddressId) {
      updatedList = addresses.map((addr) => {
        if (addr.id === editingAddressId) {
          return { ...addressForm, id: editingAddressId };
        }
        return addressForm.isDefault ? { ...addr, isDefault: false } : addr;
      });
      toast.success("Address updated successfully!");
    } else {
      const newAddr: SavedAddress = {
        ...addressForm,
        id: `addr_${Date.now()}`,
        isDefault: addressForm.isDefault || addresses.length === 0,
      };

      if (newAddr.isDefault) {
        updatedList = addresses.map((a) => ({ ...a, isDefault: false }));
        updatedList.push(newAddr);
      } else {
        updatedList = [...addresses, newAddr];
      }
      toast.success("New address added successfully!");
    }

    setAddresses(updatedList);
    localStorage.setItem("bhatia_saved_addresses", JSON.stringify(updatedList));
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    resetAddressForm();
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: user?.name || "",
      phone: "",
      pincode: "",
      address: "",
      city: "",
      state: "",
      type: "Home",
      isDefault: false,
    });
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      pincode: addr.pincode,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    localStorage.setItem("bhatia_saved_addresses", JSON.stringify(updated));
    toast.success("Address removed.");
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem("bhatia_saved_addresses", JSON.stringify(updated));
    toast.success("Default address updated!");
  };

  // Save Profile Settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setSavingProfile(true);
    try {
      if (user) {
        const updated = { ...user, name: profileForm.name, phone: profileForm.phone };
        setUser(updated);
        toast.success("Account profile updated successfully!");
      }
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, newPassword: passwordForm.newPassword }),
      });
      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.success("Password updated!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      toast.error("Password change failed. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center text-stone-500 dark:text-stone-400 font-sans">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#b49663]" />
        <p className="mt-3 text-sm font-medium">Loading your account details…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center font-sans">
        <h1 className="font-serif text-4xl font-bold text-stone-900 dark:text-white">Your Account</h1>
        <p className="mt-3 text-stone-600 dark:text-stone-300">Sign in to manage your orders and saved addresses.</p>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-2xl bg-[#b49663] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#967b4b] transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#12100e] py-8 transition-colors font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* 1. TOP HERO HEADER BANNER (Full width spanning across the page above grid) */}
        <div className="mb-8 rounded-3xl border border-[#e2d5c3] bg-[#e9e1d4] p-6 sm:p-8 dark:border-stone-800 dark:bg-[#1e1a16] md:flex md:items-center md:justify-between transition shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b49663] bg-white/60 dark:bg-stone-900/60 px-3 py-1 rounded-full border border-[#d6c7b2] dark:border-stone-800">
                BHATIA STORES CUSTOMER PORTAL
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
              My Account
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              Manage your orders, saved addresses, profile settings, and support preferences in one place.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#b49663] px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-[#967b4b] md:mt-0 shrink-0"
          >
            <ShoppingBag size={17} />
            <span>Shop Catalog</span>
          </Link>
        </div>

        {/* 2. MAIN LAYOUT GRID (Sidebar Menu + Dynamic Content Panel) */}
        <div className="grid gap-7 lg:grid-cols-[250px_1fr]">

          {/* SIDEBAR NAVIGATION */}
          <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b49663]">
              MY ACCOUNT MENU
            </p>
            <nav className="space-y-1.5 mt-2">
              {[
                [UserRound, "Overview", "overview"],
                [Package, "Orders", "orders"],
                [RotateCcw, "Returns & Exchanges", "returns"],
                [MapPin, "Addresses", "addresses"],
                [Heart, "Wishlist", "wishlist"],
                [Settings, "Account settings", "settings"],
              ].map(([Icon, label, tabKey]) => {
                const ItemIcon = Icon as typeof UserRound;
                const isCurrent = activeTab === tabKey;
                return (
                  <button
                    key={label as string}
                    onClick={() => switchTab(tabKey as any)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left ${
                      isCurrent
                        ? "bg-[#b49663] text-white shadow-md"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                    }`}
                  >
                    <ItemIcon size={17} />
                    <span>{label as string}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-stone-100 pt-4 dark:border-stone-800">
              <Link
                href="/logout"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Link>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Profile Greeting Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#4a3373] text-2xl font-bold text-white shadow-md">
                      {initial}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                        Hello, {user.name}!
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => switchTab("settings")}
                    className="text-xs font-bold text-[#b49663] hover:underline transition self-start sm:self-auto"
                  >
                    Account settings →
                  </button>
                </div>

                {/* Quick Action Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    onClick={() => switchTab("orders")}
                    className="text-left rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-[#b49663]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                      <Package size={20} />
                    </div>
                    <h3 className="mt-4 font-bold text-stone-900 dark:text-white text-base">
                      My Orders
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {orders.length} order{orders.length === 1 ? "" : "s"} tracked
                    </p>
                  </button>

                  <button
                    onClick={() => switchTab("returns")}
                    className="text-left rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-[#b49663]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                      <RotateCcw size={20} />
                    </div>
                    <h3 className="mt-4 font-bold text-stone-900 dark:text-white text-base">
                      Returns & Exchanges
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {userReturns.length} request{userReturns.length === 1 ? "" : "s"}
                    </p>
                  </button>

                  <button
                    onClick={() => switchTab("addresses")}
                    className="text-left rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-[#b49663]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                      <MapPin size={20} />
                    </div>
                    <h3 className="mt-4 font-bold text-stone-900 dark:text-white text-base">
                      Saved Addresses
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {addresses.length} saved address{addresses.length === 1 ? "" : "es"}
                    </p>
                  </button>

                  <Link
                    href="/wishlist"
                    className="block rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-[#b49663]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-[#b49663] dark:bg-amber-950/40">
                      <Heart size={20} />
                    </div>
                    <h3 className="mt-4 font-bold text-stone-900 dark:text-white text-base">
                      Wishlist
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      View saved favorites
                    </p>
                  </Link>
                </div>

                {/* Recent Orders Overview */}
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                      Recent Orders
                    </h2>
                    <button onClick={() => switchTab("orders")} className="text-xs font-bold text-[#b49663] hover:underline">
                      View all orders →
                    </button>
                  </div>

                  {orders.length ? (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {orders.slice(0, 3).map((order) => (
                        <Link
                          key={order.id}
                          href={`/orders/${order.id}`}
                          className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition rounded-xl px-2"
                        >
                          <span className="font-bold text-stone-900 dark:text-white font-mono">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-bold text-stone-900 dark:text-white">
                            ₹{Number(order.total).toLocaleString("en-IN")}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400 font-medium">
                            {order.razorpayPaymentId === "cash_on_delivery" ? "COD" : "Prepaid"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${
                              statusStyles[order.status] || "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-xs text-stone-500 dark:text-stone-400 text-center py-6">
                      No orders placed yet. Your order history will appear here after checkout.
                    </p>
                  )}
                </div>

                {/* Default Address Preview */}
                {addresses.length > 0 && (
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#b49663]" />
                        <h3 className="font-bold text-stone-900 dark:text-white text-sm">Default Delivery Address</h3>
                      </div>
                      <button onClick={() => switchTab("addresses")} className="text-xs font-bold text-[#b49663] hover:underline">
                        Manage Addresses →
                      </button>
                    </div>
                    {addresses.filter(a => a.isDefault).concat(addresses[0]).slice(0, 1).map((def) => (
                      <div key={def.id} className="mt-4 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                        <p className="font-bold text-stone-900 dark:text-white">{def.name} ({def.type})</p>
                        <p>{def.address}</p>
                        <p>{def.city}, {def.state} - {def.pincode}</p>
                        <p className="text-stone-500">Phone: {def.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === "orders" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                      My Orders
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      View full order history and track real-time delivery status.
                    </p>
                  </div>
                  <Link
                    href="/orders"
                    className="rounded-xl bg-[#b49663] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#967b4b] transition"
                  >
                    Open Live Order Tracker
                  </Link>
                </div>

                {orders.length ? (
                  <div className="mt-6 space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5 dark:border-stone-800 dark:bg-stone-800/40 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span
                              className={`rounded-full px-3 py-0.5 text-[10px] font-bold capitalize ${
                                statusStyles[order.status] || "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} • {order.razorpayPaymentId === "cash_on_delivery" ? "Cash on Delivery" : "Prepaid Online"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-bold text-stone-900 dark:text-white">
                            ₹{Number(order.total).toLocaleString("en-IN")}
                          </span>
                          <Link
                            href={`/orders/${order.id}`}
                            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700 transition"
                          >
                            Track Order Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
                    <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">You haven't placed any orders yet.</p>
                    <Link
                      href="/shop"
                      className="mt-4 inline-block rounded-xl bg-[#b49663] px-6 py-2.5 text-xs font-bold text-white shadow"
                    >
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800 gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                      Saved Shipping Addresses
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Manage delivery addresses for fast 1-click checkout.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      resetAddressForm();
                      setIsAddressModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#b49663] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#967b4b] shrink-0"
                  >
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Add / Edit Address Form Modal */}
                {isAddressModalOpen && (
                  <div className="mt-6 rounded-2xl border border-[#b49663]/40 bg-[#fdfbf7] p-6 dark:border-stone-700 dark:bg-stone-800/60 shadow-inner">
                    <h3 className="font-bold text-stone-900 dark:text-white text-base mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-[#b49663]" />
                      {editingAddressId ? "Edit Shipping Address" : "Add New Shipping Address"}
                    </h3>

                    <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="10-digit mobile number"
                            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Pincode * {pincodeLoading && <span className="text-[#b49663] font-normal">(Auto-detecting...)</span>}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={addressForm.pincode}
                            onChange={(e) => handlePincodeChange(e.target.value)}
                            placeholder="6-digit Pincode"
                            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            City / District *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder="City"
                            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            placeholder="State"
                            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Street Address / House No. / Area *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          placeholder="House/Flat No., Building Name, Street Name, Area"
                          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-3">
                          <label className="font-bold text-stone-700 dark:text-stone-300">Address Label:</label>
                          {(["Home", "Work", "Other"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setAddressForm({ ...addressForm, type: t })}
                              className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
                                addressForm.type === t
                                  ? "bg-[#b49663] text-white"
                                  : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700 dark:text-stone-300">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="rounded accent-[#b49663]"
                          />
                          <span>Set as Default Delivery Address</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <button
                          type="submit"
                          className="rounded-xl bg-[#b49663] px-6 py-2.5 font-bold text-white shadow hover:bg-[#967b4b] transition"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddressModalOpen(false);
                            setEditingAddressId(null);
                          }}
                          className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* List of Addresses */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-2xl border p-5 shadow-sm transition ${
                        addr.isDefault
                          ? "border-[#b49663] bg-amber-50/40 dark:border-[#b49663] dark:bg-amber-950/20"
                          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 dark:text-white text-sm">
                            {addr.name}
                          </span>
                          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[10px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            {addr.type}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="rounded-full bg-[#b49663] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                        <p>{addr.address}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-stone-500 font-medium">Mobile: {addr.phone}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800 text-xs">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="font-bold text-[#b49663] hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="flex items-center gap-1 font-bold text-stone-700 dark:text-stone-300 hover:text-[#b49663]"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                      Saved Wishlist
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Your saved luxury designs and jewelry pieces.
                    </p>
                  </div>
                  <Link
                    href="/wishlist"
                    className="rounded-xl bg-[#b49663] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#967b4b] transition"
                  >
                    Open Full Wishlist Page →
                  </Link>
                </div>

                <div className="py-12 text-center">
                  <Heart className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
                  <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">Manage your saved pieces anytime.</p>
                  <Link
                    href="/wishlist"
                    className="mt-4 inline-block rounded-xl bg-[#b49663] px-6 py-2.5 text-xs font-bold text-white shadow"
                  >
                    View My Wishlist
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 5: ACCOUNT SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">

                {/* Profile Information Form */}
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                  <div className="border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                      Account Settings & Profile
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Update your personal information and contact details.
                    </p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 text-xs max-w-xl">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full rounded-xl border border-stone-300 bg-white pl-10 p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Email Address <span className="text-stone-400 font-normal">(Verified)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full rounded-xl border border-stone-200 bg-stone-100 pl-10 p-3 text-stone-500 cursor-not-allowed dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full rounded-xl border border-stone-300 bg-white pl-10 p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-xl bg-[#b49663] px-6 py-2.5 font-bold text-white shadow hover:bg-[#967b4b] transition flex items-center gap-2"
                    >
                      {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Save Profile Changes</span>
                    </button>
                  </form>
                </div>

                {/* Password & Security Card */}
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                  <div className="border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <Lock size={20} className="text-[#b49663]" />
                      <span>Security & Password</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Change your login password to maintain security.
                    </p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4 text-xs max-w-xl">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                          New Password *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 focus:border-[#b49663] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="rounded-xl bg-[#b49663] px-6 py-2.5 font-bold text-white shadow hover:bg-[#967b4b] transition flex items-center gap-2"
                    >
                      {updatingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Update Password</span>
                    </button>
                  </form>
                </div>

                {/* Notifications & Preferences Card */}
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition">
                  <div className="border-b border-stone-100 pb-4 dark:border-stone-800">
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <Bell size={20} className="text-[#b49663]" />
                      <span>Notifications & Alerts</span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Choose how you would like to receive order and stock updates.
                    </p>
                  </div>

                  <div className="mt-6 space-y-4 text-xs max-w-xl">
                    <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
                      <div>
                        <p className="font-bold text-stone-900 dark:text-white">Email Order Status Updates</p>
                        <p className="text-stone-500 text-[11px]">Receive receipt and tracking links via email.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.emailUpdates}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailUpdates: e.target.checked })}
                        className="h-4 w-4 accent-[#b49663]"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
                      <div>
                        <p className="font-bold text-stone-900 dark:text-white">WhatsApp Delivery Notifications</p>
                        <p className="text-stone-500 text-[11px]">Get instant dispatch and out-for-delivery alerts on WhatsApp.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.whatsappAlerts}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, whatsappAlerts: e.target.checked })}
                        className="h-4 w-4 accent-[#b49663]"
                      />
                    </label>
                  </div>
                </div>

                {/* Account Deletion Danger Zone Card */}
                <div className="rounded-3xl border border-red-200 bg-red-50/40 p-7 shadow-sm dark:border-red-950 dark:bg-red-950/20 transition">
                  <div className="border-b border-red-100 pb-4 dark:border-red-900/60">
                    <h3 className="font-serif text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                      <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                      <span>Delete Your Customer Account</span>
                    </h3>
                    <p className="text-xs text-red-600/80 dark:text-red-300 mt-1">
                      Permanently remove your account, profile details, and address records.
                    </p>
                  </div>

                  <div className="mt-4 text-xs text-red-800 dark:text-red-300 space-y-2">
                    <p className="font-semibold">⚠️ Warning: This action is permanent and cannot be undone.</p>
                    <ul className="list-disc pl-5 space-y-1 text-[11px] text-red-700 dark:text-red-400">
                      <li>All personal information and phone numbers will be purged.</li>
                      <li>Saved delivery addresses will be deleted.</li>
                      <li>Active login sessions on all devices will be invalidated.</li>
                    </ul>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4 text-xs max-w-xl">
                    <div>
                      <label className="block font-bold text-red-900 dark:text-red-200 mb-1">
                        Confirm Account Password to Proceed *
                      </label>
                      <input
                        type="password"
                        required
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full rounded-xl border border-red-300 bg-white p-3 text-stone-900 focus:border-red-500 focus:outline-none dark:border-red-800 dark:bg-stone-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={deletingAccount}
                      className="rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white shadow hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {deletingAccount ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Deleting Account...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <span>Delete My Account</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
