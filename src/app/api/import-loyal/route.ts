import { NextRequest } from "next/server";
import { Client } from "pg";
import { randomUUID } from "node:crypto";
import { safeEqual } from "@/lib/auth";
import { apiFailure, jsonError, jsonResponse, notFound } from "@/lib/security/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return notFound();
}

export async function POST(req: NextRequest) {
  // Security: Only allow in development or with explicit enable flag
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_IMPORT_ROUTE !== "true"
  ) {
    return notFound();
  }

  // Security: Constant-time comparison with secret token
  const secret = req.headers.get("x-import-secret");
  const expectedSecret = process.env.IMPORT_SECRET;

  if (!expectedSecret || !secret || !safeEqual(secret, expectedSecret)) {
    return jsonError("Unauthorized", 401);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return jsonError("Database not configured", 503);
  }

  try {
    const client = new Client({
      connectionString: databaseUrl,
    });
    await client.connect();

    const reportedStock = [
      ["10503", 200], ["11109", 127], ["13115", 131],
      ["AGATE-114", 30], ["10539", 198], ["10579", 238], ["10693", 10],
      ["11162", 194], ["11501", 47], ["11810", 199], ["12009", 212],
      ["12209", 130], ["12308", 132], ["12402", 125], ["12407", 150],
      ["12601", 66], ["12811", 47], ["DIAMOND-12111", 299],
      ["DIAMOND-12119", 303], ["PEARL 11213", 300], ["SUNSTONE-12502", 299],
      ["SUNSTONE-12523", 69], ["DIAMOND WHITE", 104], ["PLAIN WHITE", 300],
    ];

    const visualCatalogues = [
      ...Array.from({ length: 6 }, (_, index) => ({
        name: `PGVT 600x1200 Glossy Tile - Design ${String(index + 1).padStart(2, "0")}`,
        image: `/products/new-stock/pgvt-${String(index + 1).padStart(2, "0")}.jpg`,
        description: "600x1200 glossy endless PGVT tile from the supplied 2x4 PGVT catalogue.",
        price: "1150.00",
      })),
      ...Array.from({ length: 13 }, (_, index) => ({
        name: `SunCore Matrix Light 600x600 Double Charge Tile - Design ${String(index + 1).padStart(2, "0")}`,
        image: `/products/new-stock/gnam-dc-${String(index + 1).padStart(2, "0")}.jpg`,
        description: "600x600 double-charge vitrified tile from the supplied G-NAM catalogue.",
        price: "1650.00",
      })),
    ];

    async function upsertProduct(product: {
      name: string;
      description: string;
      price: string;
      image: string;
      category: string;
      stock: number;
    }) {
      const existing = await client.query(
        "SELECT id FROM products WHERE name = $1 LIMIT 1",
        [product.name]
      );
      if (existing.rowCount && existing.rows[0]) {
        await client.query(
          "UPDATE products SET description = $1, price = $2, image = $3, category = $4, stock = $5 WHERE id = $6",
          [product.description, product.price, product.image, product.category, product.stock, existing.rows[0].id]
        );
        return "updated";
      }
      await client.query(
        `INSERT INTO products (id, name, description, price, image, category, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), product.name, product.description, product.price, product.image, product.category, product.stock]
      );
      return "inserted";
    }

    await client.query("BEGIN");
    let inserted = 0;
    let updated = 0;

    for (const [design, stock] of reportedStock) {
      const outcome = await upsertProduct({
        name: `Loyal 400x400 Tile - ${design}`,
        description: `400x400 Loyal ceramic tile design ${design}. Stock imported from the supplied July 2026 stock report.`,
        price: "800.00",
        image: "/products/catalog/bhatia-catalogue-01.jpg",
        category: "Tiles & Sanitaryware",
        stock: Number(stock),
      });
      outcome === "inserted" ? inserted++ : updated++;
    }

    for (const tile of visualCatalogues) {
      const outcome = await upsertProduct({ ...tile, category: "Tiles & Sanitaryware", stock: 10 });
      outcome === "inserted" ? inserted++ : updated++;
    }

    await client.query("COMMIT");
    await client.end();

    return jsonResponse({
      message: "Import completed successfully",
      inserted,
      updated,
    });
  } catch (error) {
    return apiFailure("import-loyal", error);
  }
}
