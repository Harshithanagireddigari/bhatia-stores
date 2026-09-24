"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, CheckCircle2, MessageSquarePlus, X, Loader2 } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: number;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingCounts: { [key: number]: number };
}

export default function ProductReviewsSection({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      toast.error("Please fill in all review fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title.trim(), comment: comment.trim(), name: name.trim() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit review.");

      toast.success("Thank you! Your review has been published.");
      setShowModal(false);
      setTitle("");
      setComment("");
      setName("");
      fetchReviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-16 rounded-3xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900 animate-pulse">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded" />
      </div>
    );
  }

  const reviewsList = data?.reviews || [];
  const avgRating = data?.averageRating || 5.0;
  const totalReviews = data?.totalReviews || reviewsList.length;

  return (
    <section className="mt-16 border-t border-stone-200 pt-12 dark:border-stone-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b49663]">
            CUSTOMER EXPERIENCES
          </p>
          <h2 className="mt-1 font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">
            Reviews & Ratings
          </h2>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#b49663] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#967b4b]"
        >
          <MessageSquarePlus size={16} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Overview Grid */}
      <div className="grid gap-8 lg:grid-cols-3 mb-10">
        {/* Rating Card */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-stone-50/50 p-8 text-center dark:border-stone-800 dark:bg-stone-800/40">
          <span className="font-serif text-5xl font-extrabold text-stone-900 dark:text-white">
            {avgRating}
          </span>
          <div className="mt-3 flex items-center justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-600"}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
            Based on {totalReviews} verified customer reviews
          </p>
        </div>

        {/* Rating Distribution Bars */}
        <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = data?.ratingCounts?.[stars] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars >= 4 ? 60 : 10;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-stone-600 dark:text-stone-300 font-semibold">{stars} ★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-[#b49663] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-stone-400 text-[11px]">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsList.map((rev) => (
          <div
            key={rev.id}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80 transition hover:border-stone-300 dark:hover:border-stone-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold text-sm text-stone-900 dark:text-white">{rev.title}</h4>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {rev.comment}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800/80 text-[11px] text-stone-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-700 dark:text-stone-300">{rev.userName}</span>
                {rev.verifiedPurchase === 1 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 size={11} /> Verified Buyer
                  </span>
                )}
              </div>
              <span>{new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Write a Product Review</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Share your experience with other customers
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition"
                    >
                      <Star
                        size={24}
                        className={star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Review Headline / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent quality and beautiful texture"
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-xs text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Detailed Feedback *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us what you liked about this product..."
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-xs text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram M."
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-xs text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b49663] py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-[#967b4b] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
