"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
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
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    
    setUploading(true);
    const data = new FormData(); 
    data.append("file", file); 
    data.append("assetType", "hero");
    
    try {
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: data 
      }); 
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Image upload failed.");
      }
      
      if (!result.imageUrl) {
        throw new Error("No image URL returned from upload service");
      }
      
      setForm((current) => ({ 
        ...current, 
        imageUrl: result.imageUrl, 
        imagePublicId: result.imagePublicId || "" 
      }));
      toast.success("Hero image uploaded successfully!");
    } catch (error) { 
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Image upload failed."); 
    } finally { 
      setUploading(false); 
      event.target.value = ""; 
    }
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
    if (!confirm(`Remove "${slide.heading}" from the homepage? Its uploaded image will also be removed from storage.`)) return;
    try { const res = await fetch(`/api/hero-slides/${slide.id}`, { method: "DELETE" }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not remove slide."); toast.success("Hero slide removed."); await loadSlides(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not remove slide."); }
  }

  async function moveSlide(index: number, direction: -1 | 1) {
    const otherIndex = index + direction; if (!slides[otherIndex]) return;
    const current = slides[index]; const other = slides[otherIndex];
    await Promise.all([updateSlide(current.id, { sortOrder: other.sortOrder }), updateSlide(other.id, { sortOrder: current.sortOrder })]);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Launchpad
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Homepage control - Manage hero slides and banners
              </p>
            </div>
            <Link
              href="/"
              target="_blank"
              className="rounded-full border border-indigo-200 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              Preview homepage ↗
            </Link>
          </div>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? "Editing slide" : "New hero slide"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingId ? "Refine your slide" : "Make the first impression yours"}
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <form onSubmit={saveSlide} className="mt-7 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Hero slide preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500 dark:text-gray-400">
                      <ImagePlus size={32} className="text-indigo-600 dark:text-indigo-400" />
                      <p className="max-w-[14rem] text-sm">Upload a wide room, tile, or sanitaryware image.</p>
                    </div>
                  )}
                </div>
                <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Upload size={16} />
                  {uploading ? "Uploading…" : form.imageUrl ? "Replace hero image" : "Upload hero image"}
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={uploadImage} 
                    disabled={uploading} 
                    className="sr-only" 
                  />
                </label>
                <p className="mt-3 text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
                  JPG, PNG or WebP · up to 5 MB · stored securely on Cloudinary
                </p>
                {uploading && (
                  <div className="mt-2 text-center text-xs text-indigo-600 dark:text-indigo-400">
                    Uploading image...
                  </div>
                )}
              </div>
              <div className="grid content-start gap-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Eyebrow
                  <input required maxLength={60} value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </label>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Main heading
                  <input required maxLength={90} value={form.heading} onChange={(event) => setForm({ ...form, heading: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </label>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Gold accent line
                  <input required maxLength={90} value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </label>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                  <textarea required maxLength={240} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </label>
                <button disabled={saving || uploading} className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                  <Plus size={16} />
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add to homepage"}
                </button>
              </div>
            </form>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your hero slides
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Homepage rotation
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {slides.filter((slide) => slide.isActive).length} active
              </span>
            </div>
            {loading ? (
              <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <LoaderCircle className="animate-spin" size={17} />
                Loading slides…
              </div>
            ) : slides.length ? (
              <div className="mt-5 grid gap-4">
                {slides.map((slide, index) => (
                  <article key={slide.id} className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-[180px_1fr_auto] sm:items-center dark:border-gray-700 dark:bg-gray-800">
                    <img src={slide.imageUrl} alt={slide.heading} className="aspect-[16/9] w-full rounded-xl object-cover" />
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-bold uppercase tracking-[.15em] text-indigo-600 dark:text-indigo-400">
                          Slide {index + 1}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${slide.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                          {slide.isActive ? "Live" : "Hidden"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {slide.heading} <span className="text-indigo-600 dark:text-indigo-400">{slide.accent}</span>
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{slide.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button onClick={() => void moveSlide(index, -1)} disabled={index === 0} aria-label="Move slide up" className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400">
                        <ArrowUp size={16} />
                      </button>
                      <button onClick={() => void moveSlide(index, 1)} disabled={index === slides.length - 1} aria-label="Move slide down" className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400">
                        <ArrowDown size={16} />
                      </button>
                      <button onClick={() => void updateSlide(slide.id, { isActive: !slide.isActive })} className="rounded-lg border border-gray-200 p-2 text-gray-600 dark:border-gray-700 dark:text-gray-400" aria-label={slide.isActive ? "Hide slide" : "Show slide"}>
                        {slide.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => editSlide(slide)} className="rounded-lg border border-gray-200 p-2 text-gray-600 dark:border-gray-700 dark:text-gray-400" aria-label="Edit slide">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => void removeSlide(slide)} className="rounded-lg border border-gray-200 p-2 text-red-600 dark:border-gray-700" aria-label="Delete slide">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">No hero slides yet. Add your first slide above to get started.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}