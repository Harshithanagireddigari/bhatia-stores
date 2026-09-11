import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

function isExternalImageUrl(value: unknown): value is string {
  try { return new URL(String(value)).protocol === "https:"; } catch { return false; }
}

function cleanText(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string") throw new Error(`Enter a ${label} of up to ${maximum} characters.`);
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maximum) throw new Error(`Enter a ${label} of up to ${maximum} characters.`);
  return cleaned;
}

async function isAdmin() {
  const user = await getSessionUser();
  return user?.role === "admin";
}

export async function GET(req: Request) {
  const includeInactive = new URL(req.url).searchParams.get("all") === "true";
  if (includeInactive && !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const slides = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt));
  return NextResponse.json(includeInactive ? slides : slides.filter((slide) => slide.isActive === 1));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await req.json();
    if (!isExternalImageUrl(body.imageUrl)) return NextResponse.json({ error: "Upload a hero image first." }, { status: 400 });
    const existing = await db.select({ id: heroSlides.id }).from(heroSlides);
    if (existing.length >= 6) return NextResponse.json({ error: "You can have up to six hero slides. Remove one before adding another." }, { status: 400 });
    const id = uuidv4();
    await db.insert(heroSlides).values({
      id,
      imageUrl: body.imageUrl,
      imagePublicId: typeof body.imagePublicId === "string" ? body.imagePublicId : null,
      eyebrow: cleanText(body.eyebrow, "eyebrow", 60),
      heading: cleanText(body.heading, "heading", 90),
      accent: cleanText(body.accent, "accent text", 90),
      description: cleanText(body.description, "description", 240),
      isActive: body.isActive === false ? 0 : 1,
      sortOrder: existing.length,
    });
    const slide = await db.select().from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
    return NextResponse.json(slide[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the hero slide." }, { status: 400 });
  }
}
