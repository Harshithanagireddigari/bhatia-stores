import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

async function requireAdmin() {
  return (await getSessionUser())?.role === "admin";
}

function makeSlug(value: unknown) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const [rows, allProducts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select({ category: products.category }).from(products),
  ]);
  return NextResponse.json(rows.map((category) => ({ ...category, products: allProducts.filter((product) => product.category === category.name).length })));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json();
  const name = String(body.name || "").trim();
  const slug = makeSlug(body.slug || name);
  if (!name || !slug) return NextResponse.json({ error: "Category name and slug are required" }, { status: 400 });
  const id = uuidv4();
  try {
    await db.insert(categories).values({ id, name, slug, image: body.image || null, description: String(body.description || ""), isVisible: body.isVisible === false ? 0 : 1, displayOnHomepage: body.displayOnHomepage === false ? 0 : 1, displayInShop: body.displayInShop === false ? 0 : 1, sortOrder: Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 0 });
    return NextResponse.json({ id }, { status: 201 });
  } catch { return NextResponse.json({ error: "A category with this name or slug already exists" }, { status: 409 }); }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json();
  if (typeof body.id !== "string") return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const changes: Record<string, string | number | null> = {};
  if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();
  if (body.slug !== undefined) { const slug = makeSlug(body.slug); if (!slug) return NextResponse.json({ error: "A valid slug is required" }, { status: 400 }); changes.slug = slug; }
  if (typeof body.image === "string" || body.image === null) changes.image = body.image;
  if (typeof body.description === "string") changes.description = body.description;
  if (typeof body.isVisible === "boolean") changes.isVisible = body.isVisible ? 1 : 0;
  if (typeof body.displayOnHomepage === "boolean") changes.displayOnHomepage = body.displayOnHomepage ? 1 : 0;
  if (typeof body.displayInShop === "boolean") changes.displayInShop = body.displayInShop ? 1 : 0;
  if (body.sortOrder !== undefined && Number.isInteger(Number(body.sortOrder))) changes.sortOrder = Number(body.sortOrder);
  try { await db.update(categories).set(changes).where(eq(categories.id, body.id)); return NextResponse.json({ success: true }); } catch { return NextResponse.json({ error: "A category with this name or slug already exists" }, { status: 409 }); }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await request.json();
  if (typeof id !== "string") return NextResponse.json({ error: "ID is required" }, { status: 400 });
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ success: true });
}
