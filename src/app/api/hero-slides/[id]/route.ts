import { eq } from "drizzle-orm";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/security/guards";
import { apiFailure, jsonResponse, notFound } from "@/lib/security/http";
import { httpsUrl, intValue, readJsonBody, rejectUnknownKeys, requiredText } from "@/lib/security/validation";
import { logServerError } from "@/lib/security/logger";

const SLIDE_FIELDS = ["imageUrl", "imagePublicId", "eyebrow", "heading", "accent", "description", "isActive", "sortOrder"] as const;
const TEXT_LIMITS = { eyebrow: 60, heading: 90, accent: 90, description: 240 } as const;

function allowedImageHosts(): string[] {
  return (process.env.IMAGE_ALLOWED_HOSTS ?? "res.cloudinary.com")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const current = await db.select({ imagePublicId: heroSlides.imagePublicId }).from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
    if (!current[0]) return notFound("Hero slide");

    const body = await readJsonBody(req);
    rejectUnknownKeys(body, SLIDE_FIELDS);

    const changes: Record<string, string | number | null> = {};
    if (body.imageUrl !== undefined) {
      changes.imageUrl = httpsUrl(body.imageUrl, { field: "Hero image", allowedHosts: allowedImageHosts() });
      changes.imagePublicId = typeof body.imagePublicId === "string" ? body.imagePublicId.slice(0, 200) : null;
    }
    for (const [key, maximum] of Object.entries(TEXT_LIMITS)) {
      if (body[key] !== undefined) changes[key] = requiredText(body[key], { field: key, max: maximum });
    }
    if (body.isActive !== undefined) changes.isActive = body.isActive ? 1 : 0;
    if (body.sortOrder !== undefined) changes.sortOrder = intValue(body.sortOrder, { field: "Slide order", min: 0, max: 99 });
    if (!Object.keys(changes).length) return jsonResponse({ error: "No changes submitted." });

    const updated = await db.update(heroSlides).set(changes).where(eq(heroSlides.id, id)).returning();
    if (changes.imagePublicId && changes.imagePublicId !== current[0].imagePublicId) {
      if (current[0].imagePublicId) {
        void cloudinary.uploader
          .destroy(current[0].imagePublicId, { resource_type: "image" })
          .catch((error) => logServerError("hero-slides.cleanup", error));
      }
    }
    return jsonResponse(updated[0]);
  } catch (error) {
    return apiFailure("hero-slides.update", error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const deleted = await db.delete(heroSlides).where(eq(heroSlides.id, id)).returning();
    if (!deleted[0]) return notFound("Hero slide");
    if (deleted[0].imagePublicId) {
      void cloudinary.uploader
        .destroy(deleted[0].imagePublicId, { resource_type: "image" })
        .catch((error) => logServerError("hero-slides.cleanup", error));
    }
    return jsonResponse({ success: true });
  } catch (error) {
    return apiFailure("hero-slides.delete", error);
  }
}
