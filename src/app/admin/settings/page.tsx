"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Truck } from "lucide-react";

type Settings = {
  storeName: string;
  supportEmail: string;
  whatsapp: string;
  prepaidEnabled: boolean;
  codEnabled: boolean;
  codLimit: string;
  homepageSections: boolean;
  maintenanceMode: boolean;
  shiprocketEmail: string;
  shiprocketPassword: string;
  shiprocketPickupLocation: string;
  shiprocketAutoPush: boolean;
};

const defaults: Settings = {
  storeName: "Bhatia Stores",
  supportEmail: "",
  whatsapp: "",
  prepaidEnabled: true,
  codEnabled: true,
  codLimit: "",
  homepageSections: true,
  maintenanceMode: false,
  shiprocketEmail: "",
  shiprocketPassword: "",
  shiprocketPickupLocation: "Primary",
  shiprocketAutoPush: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [storeRes, shiprocketRes] = await Promise.all([
          fetch("/api/admin/settings?key=store"),
          fetch("/api/admin/settings?key=shiprocket"),
        ]);

        const storeData = storeRes.ok ? await storeRes.json() : {};
        const shiprocketData = shiprocketRes.ok ? await shiprocketRes.json() : {};

        setSettings({
          ...defaults,
          ...(storeData.store || storeData.value || {}),
          shiprocketEmail: shiprocketData.value?.email || shiprocketData.shiprocket?.email || "",
          shiprocketPassword: shiprocketData.value?.password || shiprocketData.shiprocket?.password || "",
          shiprocketPickupLocation: shiprocketData.value?.pickupLocation || shiprocketData.shiprocket?.pickupLocation || "Primary",
          shiprocketAutoPush: shiprocketData.value?.autoPush ?? shiprocketData.shiprocket?.autoPush ?? true,
        });
      } catch {
        // ignore
      }
    }
    void loadSettings();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const storePayload = {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        whatsapp: settings.whatsapp,
        prepaidEnabled: settings.prepaidEnabled,
        codEnabled: settings.codEnabled,
        codLimit: settings.codLimit,
        homepageSections: settings.homepageSections,
        maintenanceMode: settings.maintenanceMode,
      };

      const shiprocketPayload = {
        email: settings.shiprocketEmail,
        password: settings.shiprocketPassword,
        pickupLocation: settings.shiprocketPickupLocation,
        autoPush: settings.shiprocketAutoPush,
      };

      await Promise.all([
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "store", value: storePayload }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "shiprocket", value: shiprocketPayload }),
        }),
      ]);

      toast.success("Store & Shiprocket settings saved!");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  const toggle = (key: keyof Settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="max-w-6xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Store Controls & Logistics</h1>
            <p className="text-sm text-gray-500">
              Configure checkout, Shiprocket automated shipping, payments, and store options.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Shiprocket Logistics Section */}
            <section className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-900/40 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="text-purple-600 dark:text-purple-400" size={20} />
                <h2 className="font-bold text-gray-900 dark:text-white">Shiprocket Shipping Integration</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Automate order delivery, courier dispatch, AWB generation, and live package tracking.
              </p>
              <div className="space-y-4">
                <Field
                  label="Shiprocket Account Email"
                  type="email"
                  value={settings.shiprocketEmail}
                  onChange={(shiprocketEmail) => setSettings({ ...settings, shiprocketEmail })}
                />
                <Field
                  label="Shiprocket Account Password"
                  type="password"
                  value={settings.shiprocketPassword}
                  onChange={(shiprocketPassword) => setSettings({ ...settings, shiprocketPassword })}
                />
                <Field
                  label="Shiprocket Pickup Location Name"
                  value={settings.shiprocketPickupLocation}
                  onChange={(shiprocketPickupLocation) => setSettings({ ...settings, shiprocketPickupLocation })}
                />
                <Toggle
                  label="Automate Shiprocket Dispatch"
                  description="Automatically push new customer orders directly to Shiprocket upon placement."
                  checked={settings.shiprocketAutoPush}
                  onChange={() => toggle("shiprocketAutoPush")}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Store & Notifications</h2>
              <div className="mt-4 grid gap-4">
                <Field
                  label="Store name"
                  value={settings.storeName}
                  onChange={(storeName) => setSettings({ ...settings, storeName })}
                />
                <Field
                  label="Support email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(supportEmail) => setSettings({ ...settings, supportEmail })}
                />
                <Field
                  label="WhatsApp number"
                  value={settings.whatsapp}
                  onChange={(whatsapp) => setSettings({ ...settings, whatsapp })}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Payments & Delivery</h2>
              <div className="mt-4 space-y-4">
                <Toggle
                  label="Prepaid payments"
                  description="Accept Razorpay payments at checkout."
                  checked={settings.prepaidEnabled}
                  onChange={() => toggle("prepaidEnabled")}
                />
                <Toggle
                  label="Cash on delivery"
                  description="Allow customers to pay when their order arrives."
                  checked={settings.codEnabled}
                  onChange={() => toggle("codEnabled")}
                />
                <Field
                  label="COD order limit (₹)"
                  type="number"
                  value={settings.codLimit}
                  onChange={(codLimit) => setSettings({ ...settings, codLimit })}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Database & Maintenance</h2>
              <div className="mt-4">
                <Toggle
                  label="Maintenance mode"
                  description="Use only while planned maintenance is in progress."
                  checked={settings.maintenanceMode}
                  onChange={() => toggle("maintenanceMode")}
                />
              </div>
            </section>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 rounded-full bg-[#b49663] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#967b4b] disabled:opacity-50"
          >
            {saving ? "Saving Controls…" : "Save Store & Shiprocket Controls"}
          </button>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none transition focus:border-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-purple-600" : "bg-gray-300"}`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
