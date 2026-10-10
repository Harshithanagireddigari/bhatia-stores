"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Users, UserPlus, ShieldCheck, Check, Trash2, KeyRound, LoaderCircle, X, Pencil } from "lucide-react";
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form for adding new admin
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: defaultPermissions,
  });

  // Modal state for editing existing admin or resetting password
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
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

  function toggleAddPermission(perm: string) {
    setAddForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  function toggleEditPermission(perm: string) {
    setEditForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast.error("Please enter Name, Email, and Password for the new Admin");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin");

      toast.success(`Admin access granted to ${addForm.name}!`);
      setShowAddForm(false);
      setAddForm({ name: "", email: "", password: "", role: "admin", permissions: defaultPermissions });
      await loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creating admin");
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(member: TeamMember) {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      password: "",
      permissions: Array.isArray(member.permissions) && member.permissions.length > 0
        ? member.permissions
        : defaultPermissions,
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          password: editForm.password.trim() || undefined,
          role: "admin",
          permissions: editForm.permissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update admin details");

      toast.success(`Admin settings updated for ${editForm.name}!`);
      setEditingMember(null);
      await loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating admin");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveAdmin(member: TeamMember) {
    if (!confirm(`Are you sure you want to remove admin privileges for ${member.name} (${member.email})?`)) return;
    try {
      const res = await fetch(`/api/admin/team?id=${member.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Admin privileges removed for ${member.name}`);
        await loadTeam();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove admin member");
      }
    } catch {
      toast.error("Failed to remove admin member");
    }
  }

  // Filter out the Super Admin from the dynamic list to avoid duplicates
  const additionalAdmins = team.filter(
    (m) => m.email.toLowerCase() !== "harshitha@bhatia.com" && m.role !== "super_admin"
  );

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
                Super Admin control portal: Add, manage, reset passwords, and assign granular permissions for all administrators.
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
            >
              <UserPlus size={16} />
              <span>{showAddForm ? "Close Form" : "+ Add Admin"}</span>
            </button>
          </div>

          {/* ADD ADMIN FORM */}
          {showAddForm && (
            <section className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-7 shadow-sm dark:border-indigo-900/50 dark:bg-gray-800 animate-fade-in">
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
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="e.g. Anushka Bhatia"
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
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="admin@example.com"
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
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* PERMISSIONS SELECTION */}
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Permissions (Administrator):
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {defaultPermissions.map((perm) => {
                      const checked = addForm.permissions.includes(perm);
                      return (
                        <button
                          type="button"
                          key={perm}
                          onClick={() => toggleAddPermission(perm)}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 font-semibold transition text-left ${
                            checked
                              ? "border-indigo-600 bg-indigo-100/60 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                              : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900"
                          }`}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-400"}`}>
                            {checked && <Check size={12} />}
                          </div>
                          <span>{perm}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-full border border-gray-300 px-5 py-2.5 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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

          {/* EDIT ADMIN / RESET PASSWORD MODAL */}
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-7 shadow-2xl dark:border-gray-700 dark:bg-gray-800 space-y-5 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="text-indigo-600" size={18} />
                    <span>Edit Admin & Reset Password</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address (Account Identifier)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={editForm.email}
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      New Password (leave empty to keep unchanged)
                    </label>
                    <input
                      type="password"
                      minLength={6}
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Enter new password to reset"
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Permissions:
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {defaultPermissions.map((perm) => {
                        const checked = editForm.permissions.includes(perm);
                        return (
                          <button
                            type="button"
                            key={perm}
                            onClick={() => toggleEditPermission(perm)}
                            className={`flex items-center gap-2 rounded-xl border p-2.5 font-semibold text-left transition ${
                              checked
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                                : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900"
                            }`}
                          >
                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-400"}`}>
                              {checked && <Check size={12} />}
                            </div>
                            <span className="text-[11px]">{perm}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="rounded-full border border-gray-300 px-5 py-2.5 font-bold text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-indigo-600 px-6 py-2.5 font-bold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <LoaderCircle className="animate-spin h-4 w-4" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADMIN TEAM MEMBERS GRID */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Team Members
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* SUPER ADMIN (HARSHITHA N) - Always displayed at top */}
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

              {/* DYNAMIC TEAM MEMBERS ADDED BY SUPER ADMIN */}
              {additionalAdmins.map((member) => (
                <div
                  key={member.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-lg shadow">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{member.name}</h3>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        title="Edit Permissions or Reset Password"
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveAdmin(member)}
                        title="Remove Admin Access"
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 text-xs dark:border-gray-700 space-y-1">
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Permissions (Administrator):</p>
                    {Array.isArray(member.permissions) &&
                      member.permissions.map((perm) => (
                        <p key={perm} className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                          <Check size={14} className="text-emerald-600" /> {perm}
                        </p>
                      ))}
                  </div>
                </div>
              ))}

              {/* EMPTY STATE IF NO OTHER ADMINS */}
              {additionalAdmins.length === 0 && !loading && (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center dark:border-gray-700 dark:bg-gray-800/40 col-span-1 sm:col-span-2">
                  <Users className="text-gray-400 mb-2" size={32} />
                  <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">No other administrators added</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    As Super Admin, you can add and manage every team member individually using the &quot;+ Add Admin&quot; button above.
                  </p>
                </div>
              )}

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
