import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

// Storefront-safe category feed: only active categories configured for Shop.
export async function GET() {
  try {
    const [rows, productRows] = await Promise.all([db.select({ id: categories.id, name: categories.name, slug: categories.slug, image: categories.image, description: categories.description })
      .from(categories)
      .where(and(eq(categories.isVisible, 1), eq(categories.displayInShop, 1)))
      .orderBy(asc(categories.sortOrder), asc(categories.name)), db.select({ category: products.category }).from(products)]);
    return NextResponse.json(rows.map((category) => ({ ...category, productCount: productRows.filter((product) => product.category === category.name).length })));
  } catch {
    // Product-derived category filters remain available while a new database is being migrated.
    return NextResponse.json([]);
  }
}
