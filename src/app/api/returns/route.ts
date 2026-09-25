import { NextResponse } from "next/server";
import { db } from "@/db";
import { returns, orders, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userReturns = await db
    .select({
      id: returns.id,
      orderId: returns.orderId,
      productId: returns.productId,
      requestType: returns.requestType,
      reason: returns.reason,
      details: returns.details,
      status: returns.status,
      adminComment: returns.adminComment,
      createdAt: returns.createdAt,
      productName: products.name,
      productImage: products.image,
      productPrice: products.price,
    })
    .from(returns)
    .innerJoin(products, eq(returns.productId, products.id))
    .where(eq(returns.userId, user.id))
    .orderBy(desc(returns.createdAt));

  return NextResponse.json(userReturns);
}
