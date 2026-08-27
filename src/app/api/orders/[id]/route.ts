import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendOrderStatusUpdateEmail } from "@/lib/order-email";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order[0]) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (user.role === "customer" && order[0].userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  return NextResponse.json({ ...order[0], items });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, trackingNumber, notes } = body;

  const existing = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!existing[0]) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If customer is requesting cancellation
  if (user.role === "customer") {
    if (existing[0].userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (status === "cancelled" && (existing[0].status === "pending" || existing[0].status === "confirmed")) {
      await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, id));
      const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      return NextResponse.json(updated[0]);
    }
    return NextResponse.json({ error: "You cannot change the status of this order." }, { status: 400 });
  }

  // Admin updates
  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const updateData: any = {};
  if (status) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (notes !== undefined) updateData.notes = notes;

  await db.update(orders).set(updateData).where(eq(orders.id, id));

  const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (status && status !== existing[0].status) {
    void sendOrderStatusUpdateEmail({
      orderId: id,
      customerName: existing[0].customerName,
      customerEmail: existing[0].customerEmail,
      newStatus: status,
      total: existing[0].total,
    });
  }

  return NextResponse.json(updated[0]);
}
