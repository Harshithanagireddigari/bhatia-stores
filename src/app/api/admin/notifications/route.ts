import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const list = await db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const unreadCount = list.filter((n) => n.isRead === 0).length;

  return NextResponse.json({
    notifications: list,
    unreadCount,
  });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.id) {
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, body.id));
  } else {
    // Mark all as read
    await db.update(notifications).set({ isRead: 1 });
  }

  return NextResponse.json({ success: true });
}
