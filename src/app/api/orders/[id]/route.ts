import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireUser } from "@/lib/security/guards";
import { apiFailure, forbidden, jsonResponse, notFound } from "@/lib/security/http";
import { oneOf, readJsonBody, rejectUnknownKeys } from "@/lib/security/validation";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order[0]) return notFound("Order");

  // Ownership is enforced here: another customer's order id returns 403 even
  // though the id is a guessable-looking UUID.
  if (gate.user.role === "customer" && order[0].userId !== gate.user.id) return forbidden();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return jsonResponse({ ...order[0], items });
}

/** Admin-only status change, restricted to the enum the schema accepts. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ["status"]);
    const status = oneOf(body.status, ORDER_STATUSES, "Status");

    await db.update(orders).set({ status }).where(eq(orders.id, id));
    const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!updated[0]) return notFound("Order");
    return jsonResponse(updated[0]);
  } catch (error) {
    return apiFailure("orders.update", error);
  }
}
