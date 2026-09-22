import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getSessionUser();
  return user?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const rows = await db.select().from(storeSettings);
  return NextResponse.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { key, value } = await request.json();
  if (typeof key !== "string" || !key || key.length > 80 || value === undefined) {
    return NextResponse.json({ error: "A setting key and value are required" }, { status: 400 });
  }
  const existing = await db.select({ key: storeSettings.key }).from(storeSettings).where(eq(storeSettings.key, key)).limit(1);
  if (existing[0]) {
    await db.update(storeSettings).set({ value, updatedAt: new Date() }).where(eq(storeSettings.key, key));
  } else {
    await db.insert(storeSettings).values({ key, value, updatedAt: new Date() });
  }
  return NextResponse.json({ key, value });
}
