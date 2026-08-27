import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { wishlists, products } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ items: [] });
  }

  try {
    const list = await db
      .select({
        id: wishlists.id,
        productId: products.id,
        name: products.name,
        price: products.price,
        image: products.image,
        category: products.category,
        stock: products.stock,
        rating: products.rating,
        createdAt: wishlists.createdAt,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, user.id))
      .orderBy(desc(wishlists.createdAt));

    return NextResponse.json({ items: list });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to save items to your wishlist" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing[0]) {
      // Toggle off / remove
      await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
      return NextResponse.json({ status: "removed", inWishlist: false });
    }

    // Add
    const id = uuidv4();
    await db.insert(wishlists).values({
      id,
      userId: user.id,
      productId,
    });

    return NextResponse.json({ status: "added", inWishlist: true }, { status: 201 });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await db.delete(wishlists).where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wishlist error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
