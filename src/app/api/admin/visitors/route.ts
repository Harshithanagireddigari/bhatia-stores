import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import type { VisitorLogEntry } from "@/app/api/track-visit/route";

export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [logsRecord, restrictedRecord] = await Promise.all([
      db
        .select({ value: storeSettings.value })
        .from(storeSettings)
        .where(eq(storeSettings.key, "visitor_logs"))
        .limit(1),
      db
        .select({ value: storeSettings.value })
        .from(storeSettings)
        .where(eq(storeSettings.key, "restricted_users"))
        .limit(1),
    ]);

    const visitors: VisitorLogEntry[] =
      logsRecord[0] && Array.isArray(logsRecord[0].value)
        ? (logsRecord[0].value as VisitorLogEntry[])
        : [];

    const restrictedUsers: string[] =
      restrictedRecord[0] && Array.isArray(restrictedRecord[0].value)
        ? (restrictedRecord[0].value as string[])
        : [];

    return NextResponse.json({
      visitors,
      restrictedUsers,
    });
  } catch (error) {
    console.error("Admin visitors fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await db
      .update(storeSettings)
      .set({ value: [], updatedAt: new Date() })
      .where(eq(storeSettings.key, "visitor_logs"));

    return NextResponse.json({ success: true, message: "Visitor logs cleared successfully." });
  } catch (error) {
    console.error("Admin clear visitors error:", error);
    return NextResponse.json({ error: "Failed to clear visitor logs" }, { status: 500 });
  }
}
