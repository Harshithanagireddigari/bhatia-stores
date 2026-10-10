"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Truck, Plus, UserPlus, Package, Check, LoaderCircle, Phone, Mail, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

type Agent = {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string | null;
  status: string;
  createdAt: string;
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  total: string;
  status: string;
};

export default function AdminDeliveryAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Agent Form State
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicleNumber: "" });
  const [savingAgent, setSavingAgent] = useState(false);

  // Assign Order State
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [assigning, setAssigning] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [agentsRes, ordersRes] = await Promise.all([
        fetch("/api/delivery-agents"),
        fetch("/api/orders"),
      ]);

      if (agentsRes.ok) {
        const agentData = await agentsRes.json();
        setAgents(Array.isArray(agentData) ? agentData : []);
      } else {
        setAgents([]);
      }

      if (ordersRes.ok) {
        const orderData = await ordersRes.json();
        setUnassignedOrders(Array.isArray(orderData) ? orderData : []);
      } else {
        setUnassignedOrders([]);
      }
    } catch {
      toast.error("Failed to load delivery management data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleAddAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast.error("Name, Phone, and Email are required");
      return;
    }

    setSavingAgent(true);
    try {
      const res = await fetch("/api/delivery-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add agent");

      toast.success(`Delivery Agent "${form.name}" registered successfully!`);
      setForm({ name: "", phone: "", email: "", vehicleNumber: "" });
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add agent");
    } finally {
      setSavingAgent(false);
    }
  }

  async function handleAssignOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder || !selectedAgent) {
      toast.error("Select both an order and a delivery agent");
      return;
    }

    setAssigning(true);
    try {
      const res = await fetch("/api/delivery-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_order",
          orderId: selectedOrder,
          agentId: selectedAgent,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign order");

      toast.success("Order assigned to delivery agent successfully!");
      setSelectedOrder("");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Assign failed");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-0 md:ml-64 flex-1 pb-20 md:pb-0 min-w-0">
        <Header />
        <main className="p-6 max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="text-indigo-600" size={24} />
                <span>Delivery Agents Management</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Register delivery personnel, assign customer orders, and enable live tracking status updates.
              </p>
            </div>

            <Link
              href="/delivery-agents"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
            >
              <span>Open Delivery Agent Portal ↗</span>
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            
            {/* CARD 1: REGISTER NEW DELIVERY AGENT */}
            <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600" />
                <span>Register New Delivery Agent</span>
              </h2>

              <form onSubmit={handleAddAgent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Agent Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="rahul@bhatia.com"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Vehicle Registration Number
                  </label>
                  <input
                    type="text"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    placeholder="DL 01 AB 1234"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingAgent}
                  className="rounded-full bg-indigo-600 px-6 py-3 font-bold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {savingAgent && <LoaderCircle className="animate-spin h-4 w-4" />}
                  <span>Register Delivery Agent</span>
                </button>
              </form>
            </section>

            {/* CARD 2: ASSIGN ORDER TO AGENT */}
            <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package size={20} className="text-indigo-600" />
                <span>Assign Order to Delivery Agent</span>
              </h2>

              <form onSubmit={handleAssignOrder} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Select Customer Order *
                  </label>
                  <select
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">-- Choose Order to Assign --</option>
                    {unassignedOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        #{ord.id.slice(0, 8).toUpperCase()} - {ord.customerName} ({ord.city}) [₹{Number(ord.total).toLocaleString("en-IN")}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Select Delivery Agent *
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">-- Choose Agent --</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {assigning && <LoaderCircle className="animate-spin h-4 w-4" />}
                  <span>Assign Order</span>
                </button>
              </form>
            </section>
          </div>

          {/* LIST OF REGISTERED AGENTS */}
          <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Registered Delivery Personnel ({agents.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading agents…</div>
            ) : agents.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((ag) => (
                  <div
                    key={ag.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{ag.name}</h3>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {(ag.status || "active").toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p className="flex items-center gap-1.5"><Phone size={13} className="text-indigo-600" /> {ag.phone}</p>
                      <p className="flex items-center gap-1.5"><Mail size={13} className="text-indigo-600" /> {ag.email}</p>
                      {ag.vehicleNumber && <p className="font-mono text-gray-500">Vehicle: {ag.vehicleNumber}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No delivery agents registered yet.</p>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
