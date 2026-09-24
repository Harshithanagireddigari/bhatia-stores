import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const [
      customerRows,
      orderCountRows,
      productCountRows,
      revenueRows,
      allOrders,
      lowStock,
      topProducts,
    ] = await Promise.all([
      db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)),
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` }).from(orders).where(sql`${orders.status} != 'cancelled'`),
      db.select({ id: orders.id, userId: orders.userId, status: orders.status, total: orders.total, createdAt: orders.createdAt }).from(orders),
      db.select({ id: products.id, name: products.name, price: products.price, stock: products.stock, image: products.image }).from(products).where(sql`${products.stock} < 10`).orderBy(products.stock).limit(8),
      db.select({
        name: orderItems.productName,
        sold: sql<number>`cast(coalesce(sum(${orderItems.quantity}), 0) as integer)`,
        totalSales: sql<number>`cast(coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0) as float)`,
      }).from(orderItems).groupBy(orderItems.productName).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(5),
    ]);

    // Calculate order status breakdown
    const orderStatusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    allOrders.forEach((o) => {
      if (o.status in orderStatusCounts) {
        orderStatusCounts[o.status] += 1;
      }
    });

    // Compute last 7 days sales
    const daysMap: Record<string, { day: string; date: string; sales: number; count: number }> = {};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      daysMap[dateStr] = {
        day: dayNames[d.getDay()],
        date: dateStr,
        sales: 0,
        count: 0,
      };
    }

    allOrders.forEach((o) => {
      if (o.status === "cancelled") return;
      const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
      if (daysMap[dateStr]) {
        daysMap[dateStr].sales += Number(o.total || 0);
        daysMap[dateStr].count += 1;
      }
    });

    const customers = customerRows.map((c) => {
      const userOrders = allOrders.filter((o) => o.userId === c.id);
      const totalSpent = userOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "N/A",
        role: c.role,
        createdAt: c.createdAt,
        orderCount: userOrders.length,
        totalSpent,
      };
    });

    const dailySales = Object.values(daysMap);

    return NextResponse.json({
      metrics: {
        customers: customers.filter((c) => c.role === "customer").length,
        orders: Number(orderCountRows[0]?.count || 0),
        products: Number(productCountRows[0]?.count || 0),
        revenue: revenueRows[0]?.total || "0",
      },
      customers,
      totalCustomers: customers.length,
      totalOrders: Number(orderCountRows[0]?.count || 0),
      totalProducts: Number(productCountRows[0]?.count || 0),
      totalRevenue: revenueRows[0]?.total || "0",
      orderStatusCounts,
      dailySales,
      lowStock,
      topProducts,
    });
  } catch (error) {
    console.error("Failed to fetch insights:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
