"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, Plus, Trash2, Upload, Video, Sparkles, CheckCircle2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type Slide = {
  id: string;
  imageUrl: string;
  imagePublicId: string | null;
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
  isActive: number;
  sortOrder: number;
};

type AuthMediaSettings = {
  mediaUrl: string;
  mediaType: "image" | "video";
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
};

const defaultAuthMedia: AuthMediaSettings = {
  mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-bathroom-interior-with-a-tub-41551-large.mp4",
  mediaType: "video",
  eyebrow: "BHATIA STORES",
  heading: "Beautiful spaces begin with the",
  accent: "right surface.",
  description: "Discover premium tiles and sanitaryware for spaces that deserve a distinctive finish.",
};

const emptyForm = {
  imageUrl: "",
  imagePublicId: "",
  eyebrow: "Bhatia Stores",
  heading: "Beautiful spaces begin with",
  accent: "the right surface.",
  description: "Discover premium tiles and sanitaryware selected for homes with lasting character.",
};

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".avi") ||
    clean.includes("video/upload") ||
    clean.includes("mixkit") ||
    clean.includes("player.vimeo.com")
  );
}

export default function LaunchpadPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auth Media State (Login / Register Screen Media)
  const [authMedia, setAuthMedia] = useState<AuthMediaSettings>(defaultAuthMedia);
  const [savingAuthMedia, setSavingAuthMedia] = useState(false);
  const [uploadingAuthMedia, setUploadingAuthMedia] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [slidesRes, authRes] = await Promise.all([
        fetch("/api/hero-slides?all=true", { cache: "no-store" }),
        fetch("/api/admin/settings?key=auth_media", { cache: "no-store" }),
      ]);

      if (slidesRes.ok) {
        const data = await slidesRes.json();
        setSlides(Array.isArray(data) ? data : []);
      }

      if (authRes.ok) {
        const authData = await authRes.json();
        const stored = authData.auth_media || authData.value || {};
        setAuthMedia({
          mediaUrl: stored.mediaUrl || defaultAuthMedia.mediaUrl,
          mediaType: stored.mediaType || (isVideoUrl(stored.mediaUrl) ? "video" : "image"),
          eyebrow: stored.eyebrow || defaultAuthMedia.eyebrow,
          heading: stored.heading || defaultAuthMedia.heading,
          accent: stored.accent || defaultAuthMedia.accent,
          description: stored.description || defaultAuthMedia.description,
        });
      }
    } catch (error) {
      toast.error("Error loading launchpad controls");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleMediaUpload(
    event: ChangeEvent<HTMLInputElement>,
    assetType: "hero" | "auth"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Please select a valid image (JPG, PNG, WebP) or video (MP4, WebM, MOV)");
      return;
    }

    const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(isVideo ? "Video file must be smaller than 50MB" : "Image file must be smaller than 10MB");
      return;
    }

    if (assetType === "hero") setUploading(true);
    if (assetType === "auth") setUploadingAuthMedia(true);

    const data = new FormData();
    data.append("file", file);
    data.append("assetType", assetType);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (!result.imageUrl) {
        throw new Error("No media URL returned from server");
      }

      if (assetType === "hero") {
        setForm((current) => ({
          ...current,
          imageUrl: result.imageUrl,
          imagePublicId: result.imagePublicId || "",
        }));
        toast.success(isVideo ? "Hero Video uploaded successfully!" : "Hero Image uploaded successfully!");
      } else {
        setAuthMedia((current) => ({
          ...current,
          mediaUrl: result.imageUrl,
          mediaType: isVideo ? "video" : "image",
        }));
        toast.success(isVideo ? "Login Background Video uploaded!" : "Login Background Image uploaded!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      if (assetType === "hero") setUploading(false);
      if (assetType === "auth") setUploadingAuthMedia(false);
      event.target.value = "";
    }
  }

  async function saveSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.imageUrl) {
      toast.error("Upload a hero image or video first.");
      return;
    }
    setSaving(true);
    try {
      const endpoint = editingId ? `/api/hero-slides/${editingId}` : "/api/hero-slides";
      const res = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save slide.");
      toast.success(editingId ? "Hero slide updated." : "Hero slide added to homepage.");
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save slide.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAuthMediaSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authMedia.mediaUrl) {
      toast.error("Please upload or enter a background media URL.");
      return;
    }

    setSavingAuthMedia(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "auth_media",
          value: authMedia,
        }),
      });

      if (!res.ok) throw new Error("Failed to save Login Page media");
      toast.success("✨ Login & Register page background media saved successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save login page media");
    } finally {
      setSavingAuthMedia(false);
    }
  }

  function editSlide(slide: Slide) {
    setEditingId(slide.id);
    setForm({
      imageUrl: slide.imageUrl,
      imagePublicId: slide.imagePublicId || "",
      eyebrow: slide.eyebrow,
      heading: slide.heading,
      accent: slide.accent,
      description: slide.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateSlide(id: string, changes: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/hero-slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update slide.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update slide.");
    }
  }

  async function removeSlide(slide: Slide) {
    if (!confirm(`Remove "${slide.heading}" from homepage?`)) return;
    try {
      const res = await fetch(`/api/hero-slides/${slide.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove slide.");
      toast.success("Hero slide removed.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove slide.");
    }
  }

  async function moveSlide(index: number, direction: -1 | 1) {
    const otherIndex = index + direction;
    if (!slides[otherIndex]) return;
    const current = slides[index];
    const other = slides[otherIndex];
    await Promise.all([
      updateSlide(current.id, { sortOrder: other.sortOrder }),
      updateSlide(other.id, { sortOrder: current.sortOrder }),
    ]);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Launchpad</span>
                <Sparkles className="text-amber-500" size={20} />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage Homepage Hero Slides & Custom Login Page Background Media (Photo / Video)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                target="_blank"
                className="rounded-full border border-purple-200 bg-white px-5 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
              >
                Preview Login Page ↗
              </Link>
              <Link
                href="/"
                target="_blank"
                className="rounded-full border border-indigo-200 bg-white px-5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
              >
                Preview Homepage ↗
              </Link>
            </div>
          </div>

          {/* SECTION 1: LOGIN & REGISTER PAGE BACKGROUND MEDIA (PHOTO OR VIDEO) */}
          <section className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50/50 via-white to-amber-50/30 p-6 shadow-sm dark:border-purple-900/40 dark:from-purple-950/20 dark:via-gray-800 dark:to-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Video className="text-purple-600 dark:text-purple-400" size={22} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Login & Register Page Background Media (Photo or Video)
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Customize the left banner photo or video displayed on the Login & Register screens for your customers.
            </p>

            <form onSubmit={saveAuthMediaSettings} className="grid gap-6 lg:grid-cols-2">
              {/* Media Preview Box */}
              <div className="rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-900 shadow-md">
                  {authMedia.mediaUrl ? (
                    isVideoUrl(authMedia.mediaUrl) || authMedia.mediaType === "video" ? (
                      <video
                        src={authMedia.mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={authMedia.mediaUrl}
                        alt="Login page background preview"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6 text-gray-400">
                      <Video size={36} className="text-purple-500 mb-2" />
                      <p className="text-xs font-semibold">No media selected yet</p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold text-amber-400 backdrop-blur">
                    {isVideoUrl(authMedia.mediaUrl) || authMedia.mediaType === "video" ? "📹 VIDEO MODE" : "🖼️ PHOTO MODE"}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-purple-700 disabled:opacity-50">
                    <Upload size={15} />
                    {uploadingAuthMedia
                      ? "Uploading Media…"
                      : "Upload Login Video or Photo"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleMediaUpload(e, "auth")}
                      disabled={uploadingAuthMedia}
                      className="sr-only"
                    />
                  </label>

                  <div className="text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Or paste direct Video / Image URL:</span>
                    <input
                      type="url"
                      value={authMedia.mediaUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        setAuthMedia({
                          ...authMedia,
                          mediaUrl: url,
                          mediaType: isVideoUrl(url) ? "video" : "image",
                        });
                      }}
                      placeholder="https://example.com/login-video.mp4 or photo.jpg"
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Login Banner Text Controls */}
              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Eyebrow Tag
                  <input
                    value={authMedia.eyebrow}
                    onChange={(e) => setAuthMedia({ ...authMedia, eyebrow: e.target.value })}
                    placeholder="BHATIA STORES"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 outline-none focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>

                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Main Heading
                  <input
                    value={authMedia.heading}
                    onChange={(e) => setAuthMedia({ ...authMedia, heading: e.target.value })}
                    placeholder="Beautiful spaces begin with the"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 outline-none focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>

                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Gold Accent Line
                  <input
                    value={authMedia.accent}
                    onChange={(e) => setAuthMedia({ ...authMedia, accent: e.target.value })}
                    placeholder="right surface."
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 outline-none focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>

                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Description
                  <textarea
                    rows={3}
                    value={authMedia.description}
                    onChange={(e) => setAuthMedia({ ...authMedia, description: e.target.value })}
                    placeholder="Discover premium tiles and sanitaryware for spaces that deserve a distinctive finish."
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 outline-none focus:border-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>

                <button
                  type="submit"
                  disabled={savingAuthMedia || uploadingAuthMedia}
                  className="w-full rounded-full bg-purple-600 py-3 text-xs font-bold text-white shadow transition hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{savingAuthMedia ? "Saving Login Media…" : "Save Login Page Media & Text"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 2: HOMEPAGE HERO SLIDES & VIDEOS */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? "Editing Hero Slide" : "New Homepage Hero Slide / Video"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingId ? "Refine your hero slide media and text" : "Add luxury photos or video slides to the homepage carousel"}
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
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-900 shadow-sm">
                  {form.imageUrl ? (
                    isVideoUrl(form.imageUrl) ? (
                      <video
                        src={form.imageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img src={form.imageUrl} alt="Hero slide preview" className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500 dark:text-gray-400">
                      <ImagePlus size={32} className="text-indigo-600 dark:text-indigo-400" />
                      <p className="max-w-[14rem] text-xs font-medium">Upload a wide room photo or video file.</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                    <Upload size={16} />
                    {uploading ? "Uploading Media…" : form.imageUrl ? "Replace Hero Media" : "Upload Hero Photo / Video"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleMediaUpload(e, "hero")}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>

                  <div className="text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Or paste media URL:</span>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://example.com/banner-video.mp4"
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-4">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Eyebrow Tag
                  <input
                    required
                    maxLength={60}
                    value={form.eyebrow}
                    onChange={(event) => setForm({ ...form, eyebrow: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Main Heading
                  <input
                    required
                    maxLength={90}
                    value={form.heading}
                    onChange={(event) => setForm({ ...form, heading: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Gold Accent Line
                  <input
                    required
                    maxLength={90}
                    value={form.accent}
                    onChange={(event) => setForm({ ...form, accent: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Description
                  <textarea
                    required
                    maxLength={240}
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-xs outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </label>

                <button
                  disabled={saving || uploading}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus size={16} />
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add to homepage"}
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 3: HERO SLIDES LIST */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Homepage Slides
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rotation order & visibility
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
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
                  <article
                    key={slide.id}
                    className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-[180px_1fr_auto] sm:items-center dark:border-gray-700 dark:bg-gray-800"
                  >
                    {isVideoUrl(slide.imageUrl) ? (
                      <video
                        src={slide.imageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="aspect-[16/9] w-full rounded-xl object-cover"
                      />
                    ) : (
                      <img
                        src={slide.imageUrl}
                        alt={slide.heading}
                        className="aspect-[16/9] w-full rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-bold uppercase tracking-[.15em] text-indigo-600 dark:text-indigo-400">
                          Slide {index + 1}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            slide.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {slide.isActive ? "Live" : "Hidden"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {slide.heading} <span className="text-indigo-600 dark:text-indigo-400">{slide.accent}</span>
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {slide.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button
                        onClick={() => void moveSlide(index, -1)}
                        disabled={index === 0}
                        aria-label="Move slide up"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => void moveSlide(index, 1)}
                        disabled={index === slides.length - 1}
                        aria-label="Move slide down"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => void updateSlide(slide.id, { isActive: !slide.isActive })}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                        aria-label={slide.isActive ? "Hide slide" : "Show slide"}
                      >
                        {slide.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => editSlide(slide)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                        aria-label="Edit slide"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => void removeSlide(slide)}
                        className="rounded-lg border border-gray-200 p-2 text-red-600 dark:border-gray-700"
                        aria-label="Delete slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  No hero slides yet. Add your first slide above to get started.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}