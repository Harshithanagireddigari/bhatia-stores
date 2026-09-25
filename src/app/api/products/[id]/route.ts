import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendLowStockAlertEmail } from "@/lib/order-email";

function isValidProductImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  const str = value.trim();
  if (str.startsWith("/") || str.startsWith("data:image/")) return true;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
    const { name, description, price, image, category, stock, suiteRoom, suiteStep, sortOrder, isFeatured } = await req.json();
    if (image !== undefined && !isValidProductImageUrl(image)) {
      return NextResponse.json({ error: "Please upload a valid product image." }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price.toString();
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (suiteRoom !== undefined) updateData.suiteRoom = suiteRoom;
    if (suiteStep !== undefined) updateData.suiteStep = suiteStep;
    if (sortOrder !== undefined && Number.isInteger(Number(sortOrder))) updateData.sortOrder = Number(sortOrder);
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured ? 1 : 0;

    await db.update(products).set(updateData).where(eq(products.id, id));

    const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (updated[0] && Number(updated[0].stock) < 10) {
      void sendLowStockAlertEmail({
        id: updated[0].id,
        name: updated[0].name,
        stock: Number(updated[0].stock),
        image: updated[0].image,
        price: updated[0].price,
      }).catch((err) => console.error("Low stock alert error:", err));
    }
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
