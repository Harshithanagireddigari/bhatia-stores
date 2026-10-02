"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Users, UserPlus, ShieldCheck, Check, Trash2, Pencil, LoaderCircle, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
};

const defaultPermissions = [
  "Manage Products",
  "Manage Orders",
  "Manage Customers",
  "Manage Coupons",
  "Manage Delivery Agents",
  "Manage Homepage Content",
];

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: defaultPermissions,
  });

  async function loadTeam() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTeam(data);
      }
    } catch {
      toast.error("Failed to load admin team members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTeam();
  }, []);

  function togglePermission(perm: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please enter Name, Email, and Password for the new Admin");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin");

      toast.success(`Admin access granted to ${form.name}!`);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "admin", permissions: defaultPermissions });
      await loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creating admin");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveAdmin(member: TeamMember) {
    if (!confirm(`Remove admin privileges for ${member.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/team?id=${member.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Admin access removed for ${member.name}`);
        await loadTeam();
      }
    } catch {
      toast.error("Failed to remove admin member");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6 max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="text-indigo-600" size={24} />
                <span>Admin Team Access Management</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share admin dashboard access with team members and assign granular management permissions.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
            >
              <UserPlus size={16} />
              <span>{showForm ? "Close Form" : "+ Add Admin"}</span>
            </button>
          </div>

          {/* ADD ADMIN MODAL FORM (Matches Image 7) */}
          {showForm && (
            <section className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-7 shadow-sm dark:border-indigo-900/50 dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <KeyRound className="text-indigo-600" size={20} />
                <span>Add Admin Team Member</span>
              </h2>

              <form onSubmit={handleAddAdmin} className="space-y-5 text-xs">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
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

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Admin Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* PERMISSIONS SELECTION (Matches Image 7) */}
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Permissions (Administrator):
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {defaultPermissions.map((perm) => {
                      const checked = form.permissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          onClick={() => togglePermission(perm)}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 font-semibold transition ${
                            checked
                              ? "border-indigo-600 bg-indigo-100/60 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                              : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900"
                          }`}
                        >
                          <div className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-400"}`}>
                            {checked && <Check size={12} />}
                          </div>
                          <span>{perm}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-full border border-gray-300 px-5 py-2.5 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-indigo-600 px-7 py-2.5 font-bold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <LoaderCircle className="animate-spin h-4 w-4" />}
                    <span>Confirm & Grant Admin Access</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ADMIN TEAM MEMBERS GRID (Matches Image 7) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Team Members
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* DEFAULT SUPER ADMIN CARD (Harshitha N) */}
              <div className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-900/60 dark:bg-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow">
                      H
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">Harshitha N</h3>
                      <p className="text-xs text-gray-500">harshitha@bhatia.com</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    Super Admin (You)
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 text-xs dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Permissions (Super Admin):</p>
                  {defaultPermissions.map((perm) => (
                    <p key={perm} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <ShieldCheck size={14} /> {perm}
                    </p>
                  ))}
                </div>
              </div>

              {/* RAHUL VERMA CARD */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-lg shadow">
                      R
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">Rahul Verma</h3>
                      <p className="text-xs text-gray-500">rahul@bhatia.com</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    Administrator
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 text-xs dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Permissions (Administrator):</p>
                  {defaultPermissions.map((perm) => (
                    <p key={perm} className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                      <Check size={14} className="text-emerald-600" /> {perm}
                    </p>
                  ))}
                </div>
              </div>

              {/* PRIYA SINGH CARD */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white font-bold text-lg shadow">
                      P
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">Priya Singh</h3>
                      <p className="text-xs text-gray-500">priya@bhatia.com</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Administrator
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 text-xs dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Permissions (Administrator):</p>
                  {defaultPermissions.map((perm) => (
                    <p key={perm} className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                      <Check size={14} className="text-emerald-600" /> {perm}
                    </p>
                  ))}
                </div>
              </div>

              {/* DYNAMIC TEAM MEMBERS CREATED VIA FORM */}
              {team.map((member) => (
                <div
                  key={member.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{member.name}</h3>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAdmin(member)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-3 text-xs dark:border-gray-700 space-y-1">
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Permissions:</p>
                    {Array.isArray(member.permissions) &&
                      member.permissions.map((perm) => (
                        <p key={perm} className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                          <Check size={14} className="text-emerald-600" /> {perm}
                        </p>
                      ))}
                  </div>
                </div>
              ))}

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
