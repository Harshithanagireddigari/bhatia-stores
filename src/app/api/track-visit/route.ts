import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export interface VisitorLogEntry {
  id: string;
  ip: string;
  path: string;
  referrer: string;
  device: string;
  userName: string;
  userEmail: string | null;
  userId: string | null;
  timestamp: string;
}

function parseDevice(ua: string): string {
  if (!ua) return "Web Browser";
  let os = "Desktop";
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone/i.test(ua)) os = "iPhone";
  else if (/iPad/i.test(ua)) os = "iPad";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS/i.test(ua)) os = "Mac";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return `${browser} (${os})`;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : "";
    const userAgent = req.headers.get("user-agent") || "";
    const device = parseDevice(userAgent);

    // Get active user if logged in
    const user = await getSessionUser();

    // Check if IP or User is restricted
    const restrictedRecord = await db
      .select({ value: storeSettings.value })
      .from(storeSettings)
      .where(eq(storeSettings.key, "restricted_users"))
      .limit(1);

    const restrictedList: string[] =
      restrictedRecord[0] && Array.isArray(restrictedRecord[0].value)
        ? (restrictedRecord[0].value as string[]).map((s) => String(s).toLowerCase().trim())
        : [];

    const isIpRestricted = restrictedList.includes(ip.toLowerCase());
    const isEmailRestricted = user?.email ? restrictedList.includes(user.email.toLowerCase()) : false;
    const isUserIdRestricted = user?.id ? restrictedList.includes(user.id.toLowerCase()) : false;

    const isRestricted = user?.role === "admin" ? false : isIpRestricted || isEmailRestricted || isUserIdRestricted;

    // Don't record admin panel visits in public visitor logs
    if (!path.startsWith("/admin") && !path.startsWith("/api")) {
      const logsRecord = await db
        .select({ value: storeSettings.value })
        .from(storeSettings)
        .where(eq(storeSettings.key, "visitor_logs"))
        .limit(1);

      let logs: VisitorLogEntry[] =
        logsRecord[0] && Array.isArray(logsRecord[0].value)
          ? (logsRecord[0].value as VisitorLogEntry[])
          : [];

      const newEntry: VisitorLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ip,
        path,
        referrer,
        device,
        userName: user?.name || "Guest Visitor",
        userEmail: user?.email || null,
        userId: user?.id || null,
        timestamp: new Date().toISOString(),
      };

      // Keep recent 150 visits
      logs = [newEntry, ...logs.slice(0, 149)];

      if (logsRecord[0]) {
        await db
          .update(storeSettings)
          .set({ value: logs, updatedAt: new Date() })
          .where(eq(storeSettings.key, "visitor_logs"));
      } else {
        await db.insert(storeSettings).values({
          key: "visitor_logs",
          value: logs,
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      restricted: isRestricted,
      ip,
    });
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json({ success: false, restricted: false }, { status: 500 });
  }
}
