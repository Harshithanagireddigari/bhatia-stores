import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, returns, orderItems } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { notifyAdmin } from "@/lib/notifications";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;
  const existingReturns = await db
    .select()
    .from(returns)
    .where(eq(returns.orderId, orderId));

  return NextResponse.json(existingReturns);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;
  const { productId, requestType = "return", reason, details } = await req.json();

  if (!productId || !reason) {
    return NextResponse.json(
      { error: "Product ID and reason are required" },
      { status: 400 }
    );
  }

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  const order = orderRows[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (user.role === "customer" && order.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "Returns and exchanges are only available for delivered orders" },
      { status: 400 }
    );
  }

  // Calculate 14-day window from deliveredAt (or fallback to createdAt if deliveredAt is not recorded)
  const deliveryTime = order.deliveredAt
    ? new Date(order.deliveredAt).getTime()
    : new Date(order.createdAt).getTime();

  const now = Date.now();
  const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000;

  if (now - deliveryTime > fourteenDaysInMs) {
    return NextResponse.json(
      {
        error:
          "Exchange / Return period has expired. Returns or exchanges must be requested within 14 days of delivery.",
      },
      { status: 400 }
    );
  }

  // Check if item belongs to order
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.productId, productId)))
    .limit(1);

  if (!itemRows[0]) {
    return NextResponse.json(
      { error: "This product was not found in the order" },
      { status: 400 }
    );
  }

  // Check if already requested
  const existingReq = await db
    .select()
    .from(returns)
    .where(and(eq(returns.orderId, orderId), eq(returns.productId, productId)))
    .limit(1);

  if (existingReq[0]) {
    return NextResponse.json(
      { error: "A return or exchange request has already been submitted for this item" },
      { status: 400 }
    );
  }

  const newReturn = {
    id: uuidv4(),
    orderId,
    productId,
    userId: user.id,
    requestType: requestType === "exchange" ? "exchange" : "return",
    reason: String(reason).trim(),
    details: details ? String(details).trim() : null,
    status: "pending",
  };

  await db.insert(returns).values(newReturn);

  // Trigger admin notification & email alert
  await notifyAdmin({
    type: "return_request",
    title: `New ${requestType.toUpperCase()} Request for Order #${orderId.slice(0, 8)}`,
    message: `Customer requested a ${requestType} for order item in Order #${orderId}. Reason: ${reason}.`,
    link: "/admin/returns",
    details: {
      orderId,
      productId,
      requestType,
      reason,
      details,
    },
  });

  return NextResponse.json({
    message: `Request for ${requestType} submitted successfully.`,
    return: newReturn,
  });
}
