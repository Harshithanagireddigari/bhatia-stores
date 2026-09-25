import { NextResponse } from "next/server";
import { db } from "@/db";
import { returns, orders, products, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rawReturns = await db
    .select({
      id: returns.id,
      orderId: returns.orderId,
      productId: returns.productId,
      userId: returns.userId,
      requestType: returns.requestType,
      reason: returns.reason,
      details: returns.details,
      status: returns.status,
      adminComment: returns.adminComment,
      createdAt: returns.createdAt,
      orderStatus: orders.status,
      deliveredAt: orders.deliveredAt,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      phone: orders.phone,
      productName: products.name,
      productImage: products.image,
      productPrice: products.price,
    })
    .from(returns)
    .innerJoin(orders, eq(returns.orderId, orders.id))
    .innerJoin(products, eq(returns.productId, products.id))
    .orderBy(desc(returns.createdAt));

  return NextResponse.json(rawReturns);
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { returnId, status, adminComment } = await req.json();

  if (!returnId || !status) {
    return NextResponse.json(
      { error: "returnId and status are required" },
      { status: 400 }
    );
  }

  const validStatuses = ["pending", "approved", "rejected", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db
    .update(returns)
    .set({
      status,
      adminComment: adminComment ?? null,
      updatedAt: new Date(),
    })
    .where(eq(returns.id, returnId));

  return NextResponse.json({ message: "Return status updated successfully" });
}
