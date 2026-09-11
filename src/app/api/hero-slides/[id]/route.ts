import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

function isExternalImageUrl(value: unknown): value is string {
  try { return new URL(String(value)).protocol === "https:"; } catch { return false; }
}

async function requireAdmin() {
  const user = await getSessionUser();
  return user?.role === "admin";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  try {
    const current = await db.select({ imagePublicId: heroSlides.imagePublicId }).from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
    if (!current[0]) return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    const body = await req.json();
    const changes: Record<string, string | number | null> = {};
    if (body.imageUrl !== undefined) {
      if (!isExternalImageUrl(body.imageUrl)) return NextResponse.json({ error: "Upload a valid hero image first." }, { status: 400 });
      changes.imageUrl = body.imageUrl;
      changes.imagePublicId = typeof body.imagePublicId === "string" ? body.imagePublicId : null;
    }
    for (const [key, maximum] of [["eyebrow", 60], ["heading", 90], ["accent", 90], ["description", 240]] as const) {
      if (body[key] !== undefined) {
        if (typeof body[key] !== "string" || !body[key].trim() || body[key].trim().length > maximum) return NextResponse.json({ error: `Invalid ${key}.` }, { status: 400 });
        changes[key] = body[key].trim();
      }
    }
    if (body.isActive !== undefined) changes.isActive = body.isActive ? 1 : 0;
    if (body.sortOrder !== undefined && (!Number.isInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 99)) return NextResponse.json({ error: "Invalid slide order." }, { status: 400 });
    if (body.sortOrder !== undefined) changes.sortOrder = body.sortOrder;
    if (!Object.keys(changes).length) return NextResponse.json({ error: "No changes submitted." }, { status: 400 });
    const updated = await db.update(heroSlides).set(changes).where(eq(heroSlides.id, id)).returning();
    if (changes.imagePublicId && changes.imagePublicId !== current[0].imagePublicId) {
      if (current[0].imagePublicId) void cloudinary.uploader.destroy(current[0].imagePublicId, { resource_type: "image" }).catch((error) => console.error("Previous hero image cleanup failed:", error));
    }
    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Could not update the hero slide." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const deleted = await db.delete(heroSlides).where(eq(heroSlides.id, id)).returning();
  if (!deleted[0]) return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
  if (deleted[0].imagePublicId) {
    void cloudinary.uploader.destroy(deleted[0].imagePublicId, { resource_type: "image" }).catch((error) => console.error("Hero image cleanup failed:", error));
  }
  return NextResponse.json({ success: true });
}
