import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products, users } from "@/db/schema";
import { eq, desc, gte } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30days";

    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "30days") {
      startDate.setDate(now.getDate() - 30);
    } else if (range === "3months") {
      startDate.setMonth(now.getMonth() - 3);
    } else if (range === "1year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Fetch all orders
    const allOrders: any[] = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const rangeOrders = allOrders.filter((o: any) => new Date(o.createdAt) >= startDate);

    // Fetch all products
    const allProducts: any[] = await db.select().from(products);
    const allUsers: any[] = await db.select().from(users).where(eq(users.role, "customer"));
    const allOrderItems: any[] = await db.select().from(orderItems);

    // KPI calculations
    const totalRevenue = rangeOrders
      .filter((o: any) => o.status !== "cancelled")
      .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    const validOrdersCount = rangeOrders.filter((o: any) => o.status !== "cancelled").length;
    const averageOrderValue = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;

    // Status breakdown
    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of rangeOrders) {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    }

    // Payment method breakdown (Prepaid vs COD)
    let prepaidCount = 0;
    let prepaidRevenue = 0;
    let codCount = 0;
    let codRevenue = 0;

    for (const o of rangeOrders) {
      if (o.status === "cancelled") continue;
      if (o.paymentMethod === "cod") {
        codCount++;
        codRevenue += Number(o.total || 0);
      } else {
        prepaidCount++;
        prepaidRevenue += Number(o.total || 0);
      }
    }

    // Revenue and Orders by date timeline
    const dateMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    const daysCount = range === "today" ? 24 : range === "7days" ? 7 : range === "30days" ? 30 : range === "3months" ? 90 : 365;

    if (range === "today") {
      for (let h = 0; h < 24; h++) {
        const hourLabel = `${String(h).padStart(2, "0")}:00`;
        dateMap[hourLabel] = { date: hourLabel, revenue: 0, orders: 0 };
      }
      for (const o of rangeOrders) {
        if (o.status === "cancelled") continue;
        const d = new Date(o.createdAt);
        const hourLabel = `${String(d.getHours()).padStart(2, "0")}:00`;
        if (dateMap[hourLabel]) {
          dateMap[hourLabel].revenue += Number(o.total || 0);
          dateMap[hourLabel].orders += 1;
        }
      }
    } else {
      // Generate day buckets
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = d.toISOString().split("T")[0];
        dateMap[dateKey] = {
          date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          revenue: 0,
          orders: 0,
        };
      }

      for (const o of rangeOrders) {
        if (o.status === "cancelled") continue;
        const dateKey = new Date(o.createdAt).toISOString().split("T")[0];
        if (dateMap[dateKey]) {
          dateMap[dateKey].revenue += Number(o.total || 0);
          dateMap[dateKey].orders += 1;
        }
      }
    }

    const timeline = Object.values(dateMap);

    // Top Selling Products & Best Categories
    const productSalesMap: Record<string, { id: string; name: string; units: number; revenue: number; category: string; image: string }> = {};
    const categorySalesMap: Record<string, { category: string; units: number; revenue: number }> = {};

    const rangeOrderIds = new Set(rangeOrders.filter((o: any) => o.status !== "cancelled").map((o: any) => o.id));

    for (const item of allOrderItems) {
      if (rangeOrderIds.has(item.orderId)) {
        const prod = allProducts.find((p: any) => p.id === item.productId);
        const category = prod?.category || "Tiles & Sanitaryware";
        const revenue = Number(item.price) * item.quantity;

        // Product map
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            units: 0,
            revenue: 0,
            category,
            image: prod?.image || "/products/new-stock/pgvt-01.jpg",
          };
        }
        productSalesMap[item.productId].units += item.quantity;
        productSalesMap[item.productId].revenue += revenue;

        // Category map
        if (!categorySalesMap[category]) {
          categorySalesMap[category] = { category, units: 0, revenue: 0 };
        }
        categorySalesMap[category].units += item.quantity;
        categorySalesMap[category].revenue += revenue;
      }
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const bestCategories = Object.values(categorySalesMap)
      .sort((a, b) => b.revenue - a.revenue);

    // Low stock products
    const lowStockProducts = allProducts
      .filter((p: any) => p.stock < 25)
      .sort((a: any, b: any) => a.stock - b.stock)
      .slice(0, 8);

    return NextResponse.json({
      range,
      kpis: {
        totalRevenue,
        totalOrders: validOrdersCount,
        allOrdersCount: rangeOrders.length,
        averageOrderValue,
        totalCustomers: allUsers.length,
        totalProducts: allProducts.length,
      },
      statusDistribution: statusCounts,
      paymentSplit: {
        prepaid: { count: prepaidCount, revenue: prepaidRevenue },
        cod: { count: codCount, revenue: codRevenue },
      },
      timeline,
      topSellingProducts,
      bestCategories,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to generate analytics data" }, { status: 500 });
  }
}
