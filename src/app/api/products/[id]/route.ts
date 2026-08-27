import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!result[0]) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Ensure images is always an array
    const prod = result[0];
    let imagesArr = [prod.image];
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      imagesArr = prod.images as string[];
    }

    return NextResponse.json({
      ...prod,
      images: imagesArr,
    });
  } catch (error) {
    console.error("Fetch single product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      image,
      images,
      category,
      stock,
      dimensions,
      finish,
      material,
      rating,
      featured,
      isPopular,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = parseFloat(price).toFixed(2);
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : [image];
    if (category !== undefined) updateData.category = category.trim();
    if (stock !== undefined) updateData.stock = parseInt(stock, 10) || 0;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (finish !== undefined) updateData.finish = finish;
    if (material !== undefined) updateData.material = material;
    if (rating !== undefined) updateData.rating = parseFloat(rating).toFixed(1);
    if (featured !== undefined) updateData.featured = featured ? 1 : 0;
    if (isPopular !== undefined) updateData.isPopular = isPopular ? 1 : 0;

    await db.update(products).set(updateData).where(eq(products.id, id));

    const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
