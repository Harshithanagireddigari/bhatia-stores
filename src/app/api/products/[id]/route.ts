import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

function isExternalImageUrl(value: unknown): value is string {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:";
  } catch { return false; }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!result[0]) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const { name, description, price, image, category, stock } = await req.json();
    if (image !== undefined && !isExternalImageUrl(image)) {
      return NextResponse.json({ error: "Product images must use the image storage URL." }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price.toString();
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;

    await db.update(products).set(updateData).where(eq(products.id, id));

    const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}
