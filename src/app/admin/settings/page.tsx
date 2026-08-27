"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Save,
  CreditCard,
  Truck,
  Phone,
  Mail,
  MapPin,
  Lock,
  Building,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    siteName: "Bhatia Stores",
    tagline: "Tiles, Sanitaryware & Faucets Showroom",
    enableCod: true,
    codExtraCharge: 0,
    freeShippingThreshold: 10000,
    shippingFee: 750,
    showroomAddress: "Bhatia Stores, Main Showroom Complex, Tile Market, New Delhi, India - 110001",
    showroomPhone: "+91 98765 43210",
    showroomWhatsApp: "919876543210",
    showroomEmail: "contact@bhatiastores.com",
    adminNotificationEmail: "orders@bhatiastores.com",
  });

  // Admin password change state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({
          ...prev,
          enableCod: data.enableCod !== undefined ? Boolean(data.enableCod) : true,
          freeShippingThreshold: data.freeShippingThreshold !== undefined ? Number(data.freeShippingThreshold) : 10000,
          shippingFee: data.shippingFee !== undefined ? Number(data.shippingFee) : 750,
          showroomAddress: data.showroomAddress || prev.showroomAddress,
          showroomPhone: data.showroomPhone || prev.showroomPhone,
          showroomWhatsApp: data.showroomWhatsApp || prev.showroomWhatsApp,
          showroomEmail: data.showroomEmail || prev.showroomEmail,
          adminNotificationEmail: data.adminNotificationEmail || prev.adminNotificationEmail,
        }));
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving store configuration...");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error();
      toast.success("Store configuration & payment rules updated successfully!", { id: toastId });
    } catch {
      toast.error("Could not save settings.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setUpdatingPassword(true);
    const toastId = toast.loading("Updating administrator password...");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");

      toast.success("Administrator password updated successfully!", { id: toastId });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.", { id: toastId });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              System Configuration
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Showroom Settings & Rules
            </h1>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-purple-800 transition disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Saving Changes..." : "Save Store Settings"}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Payment & COD Controls */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="rounded-xl bg-purple-100 p-2 text-purple-900 dark:bg-purple-950/40 dark:text-purple-400">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Payment Gateway & COD Controls
                </h3>
                <p className="text-xs text-stone-500">
                  Toggle Cash on Delivery availability across all customer checkout sessions
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3.5 cursor-pointer rounded-2xl border border-stone-200 bg-stone-50/70 p-4 hover:bg-stone-50 transition dark:border-stone-800 dark:bg-stone-800/40">
                <input
                  type="checkbox"
                  checked={settings.enableCod}
                  onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded text-purple-900 focus:ring-purple-900"
                />
                <div>
                  <p className="text-sm font-bold text-stone-900 dark:text-white">
                    Enable Cash on Delivery (COD) for Customers
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    When disabled, only "Prepaid" instant online checkout is available to buyers during checkout.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Shipping & Pallet Freight Rules */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Shipping & Pallet Freight Rates
                </h3>
                <p className="text-xs text-stone-500">
                  Configure logistics fees and complimentary delivery minimum cart values
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-stone-500">Cart subtotals above this amount unlock free freight.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Standard Flat Freight Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-stone-500">Applied when cart is below free threshold.</p>
              </div>
            </div>
          </div>

          {/* Showroom & Notification Channels */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="rounded-xl bg-stone-100 p-2 text-stone-800 dark:bg-stone-800 dark:text-stone-300">
                <Building size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Showroom Contact & Dispatch Alerts
                </h3>
                <p className="text-xs text-stone-500">
                  Contact points used on invoices, footer, and automatic notifications
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Showroom Hotline
                </label>
                <input
                  type="text"
                  value={settings.showroomPhone}
                  onChange={(e) => setSettings({ ...settings, showroomPhone: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  WhatsApp Support Number (with Country Code)
                </label>
                <input
                  type="text"
                  value={settings.showroomWhatsApp}
                  onChange={(e) => setSettings({ ...settings, showroomWhatsApp: e.target.value })}
                  placeholder="919876543210"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={settings.showroomEmail}
                  onChange={(e) => setSettings({ ...settings, showroomEmail: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Admin Order Notification Email
                </label>
                <input
                  type="email"
                  value={settings.adminNotificationEmail}
                  onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Physical Showroom Address
                </label>
                <textarea
                  rows={2}
                  value={settings.showroomAddress}
                  onChange={(e) => setSettings({ ...settings, showroomAddress: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Security / Password Management */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-900 dark:bg-purple-950/40 dark:text-purple-400">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                Administrator Password & Credentials
              </h3>
              <p className="text-xs text-stone-500">
                Update master management credentials securely
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition disabled:opacity-50"
              >
                <span>{updatingPassword ? "Updating..." : "Update Master Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
