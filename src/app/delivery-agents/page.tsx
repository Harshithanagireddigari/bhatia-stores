"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  CheckCircle,
  PackageCheck,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Upload,
  ArrowRight,
  Loader2,
  UserCheck,
  KeyRound,
  ShieldCheck,
  User,
  X,
  FileCheck,
  Building2,
  Award
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type DeliveryItem = {
  assignmentId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  total: string;
  orderStatus: string;
  currentStatus: string;
  statusNotes: string | null;
  proofImageUrl: string | null;
  deliveryOtp: string | null;
  assignedAt: string;
  updatedAt: string;
};

type DeliveryAgentProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber?: string | null;
  status?: string;
};

const statusSteps = [
  { key: "ordered", label: "Ordered" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function DeliveryAgentsPortal() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [portalView, setPortalView] = useState<"deliveries" | "completed" | "account">("deliveries");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delivery Executive Login & Profile State
  const [selectedAgentId, setSelectedAgentId] = useState<string>("agnt_rahul");
  const [agentsList, setAgentsList] = useState<DeliveryAgentProfile[]>([]);
  const [currentAgent, setCurrentAgent] = useState<DeliveryAgentProfile | null>(null);

  // Meesho OTP Modal State
  const [otpModalItem, setOtpModalItem] = useState<DeliveryItem | null>(null);
  const [inputOtp, setInputOtp] = useState<string>("");
  const [proofImage, setProofImage] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  useEffect(() => {
    // Load active delivery agents from DB
    fetch("/api/delivery-agents")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAgentsList(data);
          const active = data.find((a) => a.id === selectedAgentId) || data[0];
          setSelectedAgentId(active.id);
          setCurrentAgent(active);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedAgentId) return;
    const found = agentsList.find((a) => a.id === selectedAgentId);
    if (found) setCurrentAgent(found);

    setLoading(true);
    fetch(`/api/delivery-agents?agentId=${selectedAgentId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setDeliveries(data);
        }
      })
      .catch(() => toast.error("Could not load assigned deliveries"))
      .finally(() => setLoading(false));
  }, [selectedAgentId, agentsList]);

  async function handleStatusUpdate(item: DeliveryItem, nextStatus: string, otpValue?: string, proofUrl?: string) {
    setUpdatingId(item.assignmentId);
    try {
      const res = await fetch("/api/delivery-agents/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: item.assignmentId,
          orderId: item.orderId,
          newStatus: nextStatus,
          otp: otpValue,
          proofImageUrl: proofUrl || item.proofImageUrl,
          statusNotes: `Status updated to ${nextStatus} by executive ${currentAgent?.name || "Agent"}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success(
        nextStatus === "delivered"
          ? `Order #${item.orderId.slice(0, 8).toUpperCase()} Delivered & Verified via Customer OTP! 🎉`
          : `Status updated to "${nextStatus.replace("_", " ").toUpperCase()}"! Customer notified.`
      );

      if (data.whatsappLink && nextStatus !== "delivered") {
        window.open(data.whatsappLink, "_blank");
      }

      // Refresh list locally
      const updatedList = deliveries.map((d) =>
        d.assignmentId === item.assignmentId
          ? {
              ...d,
              currentStatus: nextStatus,
              proofImageUrl: proofUrl || d.proofImageUrl,
              updatedAt: new Date().toISOString(),
            }
          : d
      );
      setDeliveries(updatedList);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setProofImage(json.imageUrl);
      toast.success("Delivery proof photo uploaded");
    } catch (err) {
      toast.error("Proof photo upload failed");
    } finally {
      setUploadingProof(false);
    }
  }

  async function submitOtpDelivery() {
    if (!otpModalItem) return;
    if (!inputOtp.trim() || inputOtp.trim().length < 4) {
      toast.error("Please enter the 4-digit Customer Delivery OTP");
      return;
    }

    setVerifyingOtp(true);
    const success = await handleStatusUpdate(otpModalItem, "delivered", inputOtp.trim(), proofImage);
    setVerifyingOtp(false);

    if (success) {
      setOtpModalItem(null);
      setInputOtp("");
      setProofImage("");
    }
  }

  const activeDeliveriesCount = deliveries.filter((d) => d.currentStatus !== "delivered").length;
  const completedDeliveriesCount = deliveries.filter((d) => d.currentStatus === "delivered").length;

  const displayedList = deliveries.filter((d) => {
    if (portalView === "completed") return d.currentStatus === "delivered";
    if (activeTab === "all") return d.currentStatus !== "delivered";
    return d.currentStatus === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900 dark:bg-[#12100e] dark:text-white font-sans p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* TOP EXECUTIVE ACCOUNT HEADER CARD */}
        <div className="rounded-3xl border border-[#e2d5c3] bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b49663] text-white shadow-lg">
                <Truck size={30} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b49663]">
                    LOGISTICS EXECUTIVE ACCOUNT
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <UserCheck size={11} /> ACTIVE EXECUTIVE
                  </span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mt-1">
                  {currentAgent?.name || "Rahul Verma"}
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-3 mt-1">
                  <span>📱 {currentAgent?.phone || "9876543210"}</span>
                  <span>•</span>
                  <span>🚘 Vehicle: <strong className="text-stone-800 dark:text-stone-200">{currentAgent?.vehicleNumber || "DL 01 AB 1234"}</strong></span>
                </p>
              </div>
            </div>

            {/* Switch Delivery Agent Profile Selector */}
            <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
              <User size={18} className="text-[#b49663]" />
              <div>
                <span className="block text-[10px] font-bold text-stone-400 uppercase">Switch Executive Profile:</span>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="mt-0.5 bg-transparent text-xs font-bold text-stone-900 dark:text-white outline-none cursor-pointer"
                >
                  {agentsList.map((a) => (
                    <option key={a.id} value={a.id} className="dark:bg-stone-900">
                      {a.name} ({a.phone}) — {a.vehicleNumber || "Vehicle N/A"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* EXECUTIVE STATS METRICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="bg-[#fcfaf7] dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Assigned Orders</span>
              <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-1">{deliveries.length}</p>
            </div>
            <div className="bg-[#fcfaf7] dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">In-Transit / Active</span>
              <p className="text-xl font-extrabold text-amber-600 mt-1">{activeDeliveriesCount}</p>
            </div>
            <div className="bg-[#fcfaf7] dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Delivered Completed</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{completedDeliveriesCount}</p>
            </div>
            <div className="bg-[#fcfaf7] dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">OTP Verification</span>
              <p className="text-xl font-extrabold text-[#b49663] mt-1">100% Verified 🔒</p>
            </div>
          </div>
        </div>

        {/* PORTAL MAIN TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPortalView("deliveries");
                setActiveTab("all");
              }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                portalView === "deliveries"
                  ? "bg-[#b49663] text-white shadow-md"
                  : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <Truck size={15} />
              <span>Active Deliveries ({activeDeliveriesCount})</span>
            </button>

            <button
              onClick={() => setPortalView("completed")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                portalView === "completed"
                  ? "bg-[#b49663] text-white shadow-md"
                  : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <CheckCircle size={15} />
              <span>Completed ({completedDeliveriesCount})</span>
            </button>

            <button
              onClick={() => setPortalView("account")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                portalView === "account"
                  ? "bg-[#b49663] text-white shadow-md"
                  : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <User size={15} />
              <span>My Agent Account</span>
            </button>
          </div>

          {/* Status Sub-Filters for Active Deliveries */}
          {portalView === "deliveries" && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                ["all", "All Active"],
                ["ordered", "Ordered"],
                ["packed", "Packed"],
                ["shipped", "Shipped"],
                ["out_for_delivery", "Out for Delivery"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                    activeTab === key
                      ? "bg-stone-900 text-white dark:bg-stone-200 dark:text-stone-900"
                      : "bg-stone-200/60 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1 & 2: DELIVERIES & COMPLETED LIST */}
        {portalView !== "account" && (
          <div>
            {loading ? (
              <div className="py-16 text-center text-stone-500">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#b49663]" />
                <p className="mt-2 text-xs font-medium">Loading assigned delivery orders…</p>
              </div>
            ) : displayedList.length > 0 ? (
              <div className="space-y-4">
                {displayedList.map((item) => {
                  const currentIdx = statusSteps.findIndex((s) => s.key === item.currentStatus);

                  return (
                    <div
                      key={item.assignmentId}
                      className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-5"
                    >
                      {/* Customer Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 dark:border-stone-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#b49663]">
                              #{item.orderId.slice(0, 8).toUpperCase()}
                            </span>
                            {item.currentStatus === "out_for_delivery" && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                                🔑 OTP VERIFICATION REQUIRED ON ARRIVAL
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-stone-900 dark:text-white text-base mt-1">
                            {item.customerName}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                            <MapPin size={14} className="text-[#b49663]" />
                            {item.address}, {item.city}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold text-stone-900 dark:text-white">
                            ₹{Number(item.total).toLocaleString("en-IN")}
                          </span>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <a
                              href={`https://wa.me/91${item.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${item.phone}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-200"
                            >
                              <Phone size={13} />
                              <span>Call Customer</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* STEP PROGRESSION TIMELINE */}
                      <div className="py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
                          Live Order Progress
                        </p>
                        <div className="grid grid-cols-6 gap-1 text-center">
                          {statusSteps.map((step, index) => {
                            const isDone = index <= (currentIdx >= 0 ? currentIdx : 0);
                            const isCurrent = index === currentIdx;

                            return (
                              <div key={step.key} className="flex flex-col items-center">
                                <div
                                  className={`h-3.5 w-3.5 rounded-full border-2 transition ${
                                    isCurrent
                                      ? "border-[#b49663] bg-[#b49663] ring-4 ring-[#b49663]/20"
                                      : isDone
                                      ? "border-emerald-600 bg-emerald-600"
                                      : "border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"
                                  }`}
                                />
                                <span
                                  className={`mt-1.5 text-[10px] font-bold ${
                                    isCurrent
                                      ? "text-[#b49663]"
                                      : isDone
                                      ? "text-emerald-700 dark:text-emerald-400"
                                      : "text-stone-400"
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ACTION BUTTONS & OTP REQUIREMENT */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                        <div className="text-xs text-stone-500">
                          {item.statusNotes && (
                            <span className="italic">Notes: &ldquo;{item.statusNotes}&rdquo;</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {item.currentStatus !== "shipped" && item.currentStatus !== "out_for_delivery" && item.currentStatus !== "delivered" && (
                            <button
                              onClick={() => handleStatusUpdate(item, "shipped")}
                              disabled={updatingId === item.assignmentId}
                              className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-700 transition disabled:opacity-50"
                            >
                              Mark as Shipped
                            </button>
                          )}

                          {item.currentStatus !== "out_for_delivery" && item.currentStatus !== "delivered" && (
                            <button
                              onClick={() => handleStatusUpdate(item, "out_for_delivery")}
                              disabled={updatingId === item.assignmentId}
                              className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-700 transition disabled:opacity-50"
                            >
                              Mark as Out for Delivery
                            </button>
                          )}

                          {item.currentStatus !== "delivered" && (
                            <button
                              onClick={() => {
                                setOtpModalItem(item);
                                setInputOtp("");
                                setProofImage(item.proofImageUrl || "");
                              }}
                              disabled={updatingId === item.assignmentId}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                              <KeyRound size={15} />
                              <span>Verify Customer OTP & Deliver (Meesho Style)</span>
                            </button>
                          )}

                          {item.currentStatus === "delivered" && (
                            <div className="flex items-center gap-3">
                              {item.proofImageUrl && (
                                <a
                                  href={item.proofImageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                  <FileCheck size={14} /> View Proof Photo
                                </a>
                              )}
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle size={15} />
                                Delivered & OTP Verified ✓
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
                <Truck className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
                <p className="mt-3 text-sm font-bold text-stone-800 dark:text-stone-200">
                  No orders found for this view.
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  New order assignments will appear here automatically when dispatched by the store admin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY AGENT ACCOUNT VIEW */}
        {portalView === "account" && currentAgent && (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-6">
            <div className="flex items-center gap-4 border-b border-stone-100 pb-6 dark:border-stone-800">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#b49663] text-white shadow-xl text-2xl font-bold">
                {currentAgent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  {currentAgent.name}
                </h2>
                <p className="text-xs text-[#b49663] font-bold uppercase tracking-wider mt-0.5">
                  Senior Field Delivery Executive
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Bhatia Stores Express Delivery Service — Hyderabad Hub
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-[#fcfaf7] dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-4">
                <h3 className="font-serif font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                  <UserCheck size={18} className="text-[#b49663]" /> Contact & ID Information
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-500">Mobile Phone:</span>
                    <span className="font-bold text-stone-900 dark:text-white">{currentAgent.phone}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-500">Email Address:</span>
                    <span className="font-bold text-stone-900 dark:text-white">{currentAgent.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-500">Account Status:</span>
                    <span className="font-bold text-emerald-600">Active Field Agent ✓</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#fcfaf7] dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-4">
                <h3 className="font-serif font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                  <Truck size={18} className="text-[#b49663]" /> Vehicle & Fleet Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-500">Registered Vehicle:</span>
                    <span className="font-mono font-bold text-[#b49663]">{currentAgent.vehicleNumber || "DL 01 AB 1234"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-500">Verification Protocol:</span>
                    <span className="font-bold text-stone-900 dark:text-white">Meesho Customer OTP Verification</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-500">Assigned Delivery Region:</span>
                    <span className="font-bold text-stone-900 dark:text-white">Hyderabad Metro Region</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEESHO-STYLE CUSTOMER DELIVERY OTP MODAL */}
        {otpModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 dark:border-stone-800 dark:bg-stone-900 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                      Customer Delivery OTP
                    </h3>
                    <p className="text-[11px] text-stone-500">Meesho-style Delivery Verification</p>
                  </div>
                </div>
                <button
                  onClick={() => setOtpModalItem(null)}
                  className="rounded-full p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Info */}
              <div className="bg-[#f7f5f0] dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order ID:</span>
                  <span className="font-mono font-bold text-[#b49663]">#{otpModalItem.orderId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-bold text-stone-900 dark:text-white">{otpModalItem.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Phone:</span>
                  <span className="font-bold text-stone-900 dark:text-white">{otpModalItem.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Order Amount:</span>
                  <span className="font-bold text-emerald-600">₹{Number(otpModalItem.total).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* OTP Input Form */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Enter 4-Digit Customer OTP *
                </label>
                <div className="relative">
                  <KeyRound size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 4892"
                    className="w-full rounded-2xl border-2 border-[#b49663] bg-stone-50 py-3.5 pl-11 pr-4 text-center font-mono text-xl font-extrabold tracking-widest text-stone-900 outline-none focus:bg-white dark:bg-stone-950 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                  💡 Ask customer <strong>{otpModalItem.customerName}</strong> for the 4-digit Delivery OTP displayed on their order screen or SMS.
                </p>
              </div>

              {/* Upload Proof Photo */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Delivery Proof Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    <Upload size={14} />
                    <span>{uploadingProof ? "Uploading Photo…" : proofImage ? "Change Photo" : "Upload Delivery Photo"}</span>
                    <input type="file" accept="image/*" onChange={handleProofUpload} className="sr-only" />
                  </label>
                  {proofImage && (
                    <img src={proofImage} alt="Proof" className="h-10 w-10 rounded-lg object-cover border border-emerald-500" />
                  )}
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                onClick={submitOtpDelivery}
                disabled={verifyingOtp || !inputOtp.trim()}
                className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying OTP…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Verify OTP & Mark Delivered</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
