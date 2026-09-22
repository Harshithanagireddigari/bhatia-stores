import { db } from "@/db";
import { products } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/security/guards";
import { apiFailure, jsonResponse } from "@/lib/security/http";
import { readJsonBody, rejectUnknownKeys } from "@/lib/security/validation";
import { parseProductInput } from "@/lib/product-input";

const PRODUCT_FIELDS = ["name", "description", "price", "image", "category", "stock"] as const;

/**
 * Public catalogue read, ordered by age and filtered by category/search.
 * Only product columns are returned; nothing here is session-derived.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim().slice(0, 60);
  const search = searchParams.get("search")?.trim().slice(0, 100);

  const rows = await db.select().from(products).orderBy(products.createdAt);
  const needle = search?.toLowerCase();
  const filtered = rows.filter((product) => {
    const inCategory = !category || product.category === category;
    const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return inCategory && (!needle || haystack.includes(needle));
  });
  return jsonResponse(filtered);
}

/**
 * Admin-only create. Authorisation is checked on the server before the body is
 * even read, and every field is re-validated here regardless of what the admin
 * form sent: hiding the button in the UI is not the control, this is.
 */
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, PRODUCT_FIELDS);
    const input = parseProductInput(body);

    const id = uuidv4();
    await db.insert(products).values({
      id,
      name: input.name!,
      description: input.description!,
      price: input.price!,
      image: input.image!,
      category: input.category!,
      stock: input.stock ?? 0,
    });

    const created = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return jsonResponse(created[0], 201);
  } catch (error) {
    return apiFailure("products.create", error);
  }
}
