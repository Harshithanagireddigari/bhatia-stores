import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendCustomerOrderWhatsAppSMS } from "@/lib/whatsapp-sms";

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
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updatePayload: Record<string, any> = { status };
  if (status === "delivered") {
    updatePayload.deliveredAt = new Date();
  }

  await db.update(orders).set(updatePayload).where(eq(orders.id, id));

  const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const targetOrder = updated[0];

  if (targetOrder) {
    // Send automated WhatsApp confirmation message to customer upon status update
    void sendCustomerOrderWhatsAppSMS({
      phone: targetOrder.phone,
      customerName: targetOrder.customerName,
      orderId: targetOrder.id,
      totalAmount: targetOrder.total,
      itemsCount: 1,
    }).catch((err) => console.error("WhatsApp status update dispatch error:", err));
  }

  return NextResponse.json(targetOrder);
}
