"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type Slide = {
  id: string; imageUrl: string; imagePublicId: string | null; eyebrow: string; heading: string; accent: string; description: string; isActive: number; sortOrder: number;
};

const emptyForm = { imageUrl: "", imagePublicId: "", eyebrow: "Bhatia Stores", heading: "Beautiful spaces begin with", accent: "the right surface.", description: "Discover premium tiles and sanitaryware selected for homes with lasting character." };

export default function LaunchpadPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadSlides() {
    try { const res = await fetch("/api/hero-slides?all=true", { cache: "no-store" }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not load hero slides."); setSlides(data); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load hero slides."); } finally { setLoading(false); }
  }
  useEffect(() => { void loadSlides(); }, []);

  function resetForm() { setEditingId(null); setForm(emptyForm); }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData(); data.append("file", file); data.append("assetType", "hero");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data }); const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Image upload failed.");
      setForm((current) => ({ ...current, imageUrl: result.imageUrl, imagePublicId: result.imagePublicId || "" }));
      toast.success("Hero image uploaded to image storage.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Image upload failed."); } finally { setUploading(false); event.target.value = ""; }
  }

  async function saveSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.imageUrl) { toast.error("Upload a hero image first."); return; }
    setSaving(true);
    try {
      const endpoint = editingId ? `/api/hero-slides/${editingId}` : "/api/hero-slides";
      const res = await fetch(endpoint, { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not save the slide.");
      toast.success(editingId ? "Hero slide updated." : "Hero slide added to your homepage."); resetForm(); await loadSlides();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save the slide."); } finally { setSaving(false); }
  }

  function editSlide(slide: Slide) { setEditingId(slide.id); setForm({ imageUrl: slide.imageUrl, imagePublicId: slide.imagePublicId || "", eyebrow: slide.eyebrow, heading: slide.heading, accent: slide.accent, description: slide.description }); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function updateSlide(id: string, changes: Record<string, unknown>) {
    try { const res = await fetch(`/api/hero-slides/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not update slide."); await loadSlides(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update slide."); }
  }

  async function removeSlide(slide: Slide) {
    if (!confirm(`Remove “${slide.heading}” from the homepage? Its uploaded image will also be removed from storage.`)) return;
    try { const res = await fetch(`/api/hero-slides/${slide.id}`, { method: "DELETE" }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not remove slide."); toast.success("Hero slide removed."); await loadSlides(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not remove slide."); }
  }

  async function moveSlide(index: number, direction: -1 | 1) {
    const otherIndex = index + direction; if (!slides[otherIndex]) return;
    const current = slides[index]; const other = slides[otherIndex];
    await Promise.all([updateSlide(current.id, { sortOrder: other.sortOrder }), updateSlide(other.id, { sortOrder: current.sortOrder })]);
  }

  return <main className="min-h-screen bg-[#f8f6f1] px-4 py-9 sm:px-6"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/admin" className="text-sm font-semibold text-[#4a3373]">← Admin dashboard</Link><p className="eyebrow mt-6">Homepage control</p><h1 className="mt-2 font-serif text-4xl text-[#282420]">Launchpad</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Upload your own hero images, write the homepage message, and decide the order in which slides appear.</p></div><Link href="/" target="_blank" className="rounded-full border border-[#b49663] bg-white px-5 py-3 text-sm font-semibold text-[#5d4317]">Preview homepage ↗</Link></div>
    <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">{editingId ? "Editing slide" : "New hero slide"}</p><h2 className="mt-2 font-serif text-3xl">{editingId ? "Refine your slide" : "Make the first impression yours"}</h2></div>{editingId && <button type="button" onClick={resetForm} className="text-sm font-semibold text-[#4a3373]">Cancel edit</button>}</div>
      <form onSubmit={saveSlide} className="mt-7 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-xl border border-dashed border-[#cdbb9d] bg-[#f8f3eb] p-4"><div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#e7ddd0]">{form.imageUrl ? <img src={form.imageUrl} alt="Hero slide preview" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-stone-500"><ImagePlus size={32} className="text-[#9b7b40]"/><p className="max-w-[14rem] text-sm">Upload a wide room, tile, or sanitaryware image.</p></div>}</div><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4a3373] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#372657]"><Upload size={16}/>{uploading ? "Uploading…" : form.imageUrl ? "Replace hero image" : "Upload hero image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading} className="sr-only" /></label><p className="mt-3 text-center text-xs leading-5 text-stone-500">JPG, PNG or WebP · up to 5 MB · stored securely on Cloudinary</p></div>
        <div className="grid content-start gap-4"><label className="text-sm font-semibold text-stone-700">Eyebrow<input required maxLength={60} value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" /></label><label className="text-sm font-semibold text-stone-700">Main heading<input required maxLength={90} value={form.heading} onChange={(event) => setForm({ ...form, heading: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" /></label><label className="text-sm font-semibold text-stone-700">Gold accent line<input required maxLength={90} value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" /></label><label className="text-sm font-semibold text-stone-700">Description<textarea required maxLength={240} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#4a3373]" /></label><button disabled={saving || uploading} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#4a3373] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#372657] disabled:opacity-50"><Plus size={16}/>{saving ? "Saving…" : editingId ? "Save changes" : "Add to homepage"}</button></div></form></section>
    <section className="mt-8"><div className="flex items-center justify-between"><div><p className="eyebrow">Your hero slides</p><h2 className="mt-2 font-serif text-3xl">Homepage rotation</h2></div><span className="rounded-full bg-[#e9e1d4] px-4 py-2 text-sm font-semibold text-[#5d4317]">{slides.filter((slide) => slide.isActive).length} active</span></div>{loading ? <div className="mt-5 flex items-center gap-2 text-sm text-stone-500"><LoaderCircle className="animate-spin" size={17}/> Loading slides…</div> : slides.length ? <div className="mt-5 grid gap-4">{slides.map((slide, index) => <article key={slide.id} className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[180px_1fr_auto] sm:items-center"><img src={slide.imageUrl} alt={slide.heading} className="aspect-[16/9] w-full rounded-xl object-cover"/><div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#9b7b40]">Slide {index + 1}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${slide.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{slide.isActive ? "Live" : "Hidden"}</span></div><h3 className="mt-2 font-serif text-2xl text-stone-900">{slide.heading} <span className="text-[#9b7b40]">{slide.accent}</span></h3><p className="mt-1 line-clamp-2 text-sm text-stone-500">{slide.description}</p></div><div className="flex flex-wrap gap-2 sm:justify-end"><button onClick={() => void moveSlide(index, -1)} disabled={index === 0} aria-label="Move slide up" className="rounded-lg border border-stone-200 p-2 text-stone-600 disabled:opacity-30"><ArrowUp size={16}/></button><button onClick={() => void moveSlide(index, 1)} disabled={index === slides.length - 1} aria-label="Move slide down" className="rounded-lg border border-stone-200 p-2 text-stone-600 disabled:opacity-30"><ArrowDown size={16}/></button><button onClick={() => void updateSlide(slide.id, { isActive: !slide.isActive })} className="rounded-lg border border-stone-200 p-2 text-stone-600">{slide.isActive ? <EyeOff size={16}/> : <Eye size={16}/>}</button><button onClick={() => editSlide(slide)} className="rounded-lg border border-stone-200 p-2 text-[#4a3373]"><Pencil size={16}/></button><button onClick={() => void removeSlide(slide)} className="rounded-lg border border-red-100 p-2 text-red-700"><Trash2 size={16}/></button></div></article>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cdbb9d] bg-[#fbf8f3] p-10 text-center"><ImagePlus className="mx-auto text-[#9b7b40]" size={32}/><h3 className="mt-4 font-serif text-2xl">No hero images yet</h3><p className="mt-2 text-sm text-stone-600">Upload your first image above. Nothing from the product catalogue will be used here.</p></div>}</section>
  </div></main>;
}
