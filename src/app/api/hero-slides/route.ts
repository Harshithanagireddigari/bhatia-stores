import { asc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { requireAdmin } from "@/lib/security/guards";
import { apiFailure, jsonResponse } from "@/lib/security/http";
import { httpsUrl, readJsonBody, rejectUnknownKeys, requiredText } from "@/lib/security/validation";

const SLIDE_FIELDS = ["imageUrl", "imagePublicId", "eyebrow", "heading", "accent", "description", "isActive", "sortOrder"] as const;
const MAX_SLIDES = 6;

function allowedImageHosts(): string[] {
  return (process.env.IMAGE_ALLOWED_HOSTS ?? "res.cloudinary.com")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function slideImage(value: unknown) {
  return httpsUrl(value, { field: "Hero image", allowedHosts: allowedImageHosts() });
}

function cleanText(value: unknown, label: string, maximum: number): string {
  return requiredText(value, { field: label, max: maximum });
}

/**
 * Public read returns only active slides. `?all=true` is an admin-only view,
 * and that check happens on the server — the admin UI hiding the toggle is
 * cosmetic.
 */
export async function GET(req: Request) {
  const includeInactive = new URL(req.url).searchParams.get("all") === "true";
  if (includeInactive) {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
  }
  const slides = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt));
  return jsonResponse(includeInactive ? slides : slides.filter((slide) => slide.isActive === 1));
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, SLIDE_FIELDS);
    const existing = await db.select({ id: heroSlides.id }).from(heroSlides);
    if (existing.length >= MAX_SLIDES) {
      return jsonResponse({ error: `You can have up to ${MAX_SLIDES} hero slides. Remove one before adding another.` });
    }
    const id = uuidv4();
    await db.insert(heroSlides).values({
      id,
      imageUrl: slideImage(body.imageUrl),
      imagePublicId: typeof body.imagePublicId === "string" ? body.imagePublicId.slice(0, 200) : null,
      eyebrow: cleanText(body.eyebrow, "Eyebrow", 60),
      heading: cleanText(body.heading, "Heading", 90),
      accent: cleanText(body.accent, "Accent text", 90),
      description: cleanText(body.description, "Description", 240),
      isActive: body.isActive === false ? 0 : 1,
      sortOrder: existing.length,
    });
    const slide = await db.select().from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
    return jsonResponse(slide[0], 201);
  } catch (error) {
    return apiFailure("hero-slides.create", error);
  }
}
