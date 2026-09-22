import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/security/guards";
import { apiFailure, jsonResponse, notFound } from "@/lib/security/http";
import { readJsonBody, rejectUnknownKeys } from "@/lib/security/validation";
import { parseProductInput } from "@/lib/product-input";

const PRODUCT_FIELDS = ["name", "description", "price", "image", "category", "stock"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!result[0]) return notFound("Product");
  return jsonResponse(result[0]);
}

/** Admin-only update. Unknown keys are rejected, so `role`-style fields cannot be smuggled in. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, PRODUCT_FIELDS);
    const input = parseProductInput(body, { partial: true });
    if (!Object.keys(input).length) return jsonResponse({ error: "No changes submitted." });

    await db.update(products).set(input).where(eq(products.id, id));
    const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return jsonResponse(updated[0]);
  } catch (error) {
    return apiFailure("products.update", error);
  }
}

/** Admin-only delete. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    await db.delete(products).where(eq(products.id, id));
    return jsonResponse({ success: true });
  } catch (error) {
    return apiFailure("products.delete", error);
  }
}
