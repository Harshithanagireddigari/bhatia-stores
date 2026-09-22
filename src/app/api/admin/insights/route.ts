import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const [customerRows, orderRows, productRows, revenueRows, lowStock, topProducts] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt }).from(users).where(eq(users.role, "customer")).orderBy(desc(users.createdAt)),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` }).from(orders).where(eq(orders.status, "delivered")),
    db.select().from(products).orderBy(products.stock).limit(8),
    db.select({ name: orderItems.productName, sold: sql<number>`sum(${orderItems.quantity})` }).from(orderItems).groupBy(orderItems.productName).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(5),
  ]);
  return NextResponse.json({
    customers: customerRows,
    metrics: { customers: customerRows.length, orders: Number(orderRows[0]?.count || 0), products: Number(productRows[0]?.count || 0), revenue: revenueRows[0]?.total || "0" },
    lowStock,
    topProducts,
  });
}
