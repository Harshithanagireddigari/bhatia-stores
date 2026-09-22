"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

type Category = { id: string; name: string; slug: string; image: string | null; description: string; isVisible: number; displayOnHomepage: number; displayInShop: number; sortOrder: number; products: number };
type CategoryForm = { name: string; slug: string; image: string; description: string; isVisible: boolean; displayOnHomepage: boolean; displayInShop: boolean; sortOrder: string };
const emptyForm: CategoryForm = { name: "", slug: "", image: "", description: "", isVisible: true, displayOnHomepage: true, displayInShop: true, sortOrder: "0" };
const makeSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadCategories() {
    try { const response = await fetch("/api/admin/categories", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setCategories(data); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not load categories"); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    const task = window.setTimeout(() => { void loadCategories(); }, 0);
    return () => window.clearTimeout(task);
  }, []);

  function openCreate() { setEditing(null); setForm(emptyForm); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openEdit(category: Category) { setEditing(category); setForm({ name: category.name, slug: category.slug, image: category.image || "", description: category.description, isVisible: Boolean(category.isVisible), displayOnHomepage: Boolean(category.displayOnHomepage), displayInShop: Boolean(category.displayInShop), sortOrder: String(category.sortOrder) }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function closeForm() { setEditing(null); setForm(emptyForm); setShowForm(false); }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file); data.append("assetType", "category");
    try { const response = await fetch("/api/upload", { method: "POST", body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Image upload failed"); setForm((current) => ({ ...current, image: result.imageUrl })); toast.success("Category image uploaded"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Image upload failed"); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!form.name.trim() || !form.slug.trim()) return toast.error("Category name and slug are required");
    setSaving(true);
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
    try {
      const response = await fetch("/api/admin/categories", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not save category");
      toast.success(editing ? "Category updated" : "Category created"); closeForm(); await loadCategories();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save category"); }
    finally { setSaving(false); }
  }
  async function toggleCategory(category: Category) { const response = await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: category.id, isVisible: !category.isVisible }) }); if (!response.ok) return toast.error("Could not update category"); await loadCategories(); }
  async function removeCategory(category: Category) { if (!confirm(`Delete “${category.name}”? Products assigned to it will stay in the catalog.`)) return; const response = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: category.id }) }); if (!response.ok) return toast.error("Could not delete category"); toast.success("Category deleted"); await loadCategories(); }

  return <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900"><Sidebar /><div className="ml-64 flex-1"><Header /><main className="p-6">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage your store categories and where they appear.</p></div><button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338ca]"><Plus size={17} /> Add Category</button></div>

    {showForm && <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? "Edit category" : "New category"}</h2><p className="text-sm text-gray-500">Control its image, visibility, and display placement.</p></div><button type="button" onClick={closeForm} className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300">Cancel</button></div><form onSubmit={saveCategory} className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
      <div><div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900">{form.image ? <img src={form.image} alt="Category preview" className="h-full w-full object-cover" /> : <div className="text-center text-gray-500"><ImagePlus className="mx-auto mb-2" size={30} /><span className="text-sm">Category image</span></div>}</div><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"><Upload size={15} />{uploading ? "Uploading…" : form.image ? "Replace image" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={uploadImage} className="sr-only" /></label>{form.image && <button type="button" onClick={() => setForm({ ...form, image: "" })} className="mt-2 w-full text-xs font-semibold text-red-600">Remove image</button>}</div>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Category name" required value={form.name} onChange={(name) => setForm({ ...form, name, slug: editing ? form.slug : makeSlug(name) })}/><Field label="Slug" required value={form.slug} onChange={(slug) => setForm({ ...form, slug: makeSlug(slug) })}/><label className="md:col-span-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Premium sanitaryware for modern bathrooms…" className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 font-normal outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" /></label><Field label="Display order" type="number" value={form.sortOrder} onChange={(sortOrder) => setForm({ ...form, sortOrder })}/><div className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"><Switch label="Status" description="Active categories are live." checked={form.isVisible} onChange={() => setForm({ ...form, isVisible: !form.isVisible })}/></div><div className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"><Switch label="Display on Homepage" description="Feature this category on home." checked={form.displayOnHomepage} onChange={() => setForm({ ...form, displayOnHomepage: !form.displayOnHomepage })}/></div><div className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"><Switch label="Display in Shop" description="Show it in shop navigation." checked={form.displayInShop} onChange={() => setForm({ ...form, displayInShop: !form.displayInShop })}/></div><div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={closeForm} className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">Cancel</button><button disabled={saving || uploading} className="rounded-full bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:opacity-50">{saving ? "Saving…" : "Save Category"}</button></div></div>
    </form></section>}

    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">{loading ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500"><LoaderCircle className="animate-spin" size={17} /> Loading categories…</div> : categories.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-700/50"><tr><th className="px-5 py-4">Image</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Products</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700"><td className="px-5 py-3">{category.image ? <img src={category.image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-700"><ImagePlus size={19} /></div>}</td><td className="px-5 py-3"><p className="font-semibold text-gray-900 dark:text-white">{category.name}</p><p className="mt-0.5 text-xs text-gray-500">/{category.slug}</p></td><td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-200">{category.products}</td><td className="px-5 py-3"><button onClick={() => void toggleCategory(category)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${category.isVisible ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>{category.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}{category.isVisible ? "Live" : "Hidden"}</button></td><td className="px-5 py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(category)} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/30" aria-label={`Edit ${category.name}`}><Pencil size={16} /></button><button onClick={() => void removeCategory(category)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <div className="p-12 text-center"><ImagePlus className="mx-auto text-gray-400" size={30} /><p className="mt-3 font-medium text-gray-700 dark:text-gray-200">No categories yet</p><p className="mt-1 text-sm text-gray-500">Add your first product category to organise the store.</p><button onClick={openCreate} className="mt-5 rounded-full bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca]">Add Category</button></div>}</section>
  </main></div></div>;
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}{required && " *"}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 font-normal outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" /></label>; }
function Switch({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) { return <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p><p className="text-xs text-gray-500">{description}</p></div><button type="button" onClick={onChange} aria-pressed={checked} className={`h-6 w-11 rounded-full p-0.5 transition ${checked ? "bg-[#4f46e5]" : "bg-gray-300 dark:bg-gray-600"}`}><span className={`block h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} /></button></div>; }
