import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeSettings, sessions } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const record = await db
    .select({ value: storeSettings.value })
    .from(storeSettings)
    .where(eq(storeSettings.key, "restricted_users"))
    .limit(1);

  const list: string[] = record[0] && Array.isArray(record[0].value) ? (record[0].value as string[]) : [];
  return NextResponse.json({ restrictedUsers: list });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { identifier, userId, restricted } = await req.json();
  if (!identifier && !userId) {
    return NextResponse.json({ error: "Identifier (email or userId) is required." }, { status: 400 });
  }

  const targetIdentifier = String(identifier || userId).trim().toLowerCase();

  const record = await db
    .select({ value: storeSettings.value })
    .from(storeSettings)
    .where(eq(storeSettings.key, "restricted_users"))
    .limit(1);

  let list: string[] = record[0] && Array.isArray(record[0].value) ? (record[0].value as string[]) : [];

  if (restricted) {
    // Add to restricted list
    if (!list.includes(targetIdentifier)) {
      list.push(targetIdentifier);
    }
    if (userId && !list.includes(userId)) {
      list.push(userId);
    }
    // Invalidate active sessions for this user
    if (userId) {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    }
  } else {
    // Remove from restricted list
    list = list.filter((item) => item !== targetIdentifier && item !== userId);
  }

  if (record[0]) {
    await db
      .update(storeSettings)
      .set({ value: list, updatedAt: new Date() })
      .where(eq(storeSettings.key, "restricted_users"));
  } else {
    await db.insert(storeSettings).values({
      key: "restricted_users",
      value: list,
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({
    success: true,
    restrictedUsers: list,
    message: restricted ? `User ${targetIdentifier} restricted.` : `User ${targetIdentifier} access restored.`,
  });
}
