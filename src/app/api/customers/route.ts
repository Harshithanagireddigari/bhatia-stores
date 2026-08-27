import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const allUsers: any[] = await db.select().from(users).orderBy(desc(users.createdAt));
    const allOrders: any[] = await db.select().from(orders);

    const customersWithStats = allUsers.map((u: any) => {
      const userOrders = allOrders.filter((o: any) => o.userId === u.id && o.status !== "cancelled");
      const totalSpend = userOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        totalOrders: userOrders.length,
        totalSpend,
      };
    });

    return NextResponse.json(customersWithStats);
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
