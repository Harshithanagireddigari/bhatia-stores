import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

// Storefront-safe category feed: only active categories configured for Shop.
export async function GET() {
  try {
    const [rows, productRows] = await Promise.all([
      db.select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        image: categories.image,
        description: categories.description,
      })
        .from(categories)
        .where(and(eq(categories.isVisible, 1), eq(categories.displayInShop, 1)))
        .orderBy(asc(categories.sortOrder), asc(categories.name)),
      db.select({ category: products.category }).from(products),
    ]);

    const sanitized = rows.map((category) => {
      const isClean = typeof category.image === "string" && !category.image.startsWith("data:") && !category.image.includes("broken");
      return {
        ...category,
        image: isClean ? category.image : null,
        productCount: productRows.filter((product) => product.category === category.name).length,
      };
    });

    const response = NextResponse.json(sanitized);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return response;
  } catch {
    return NextResponse.json([]);
  }
}
