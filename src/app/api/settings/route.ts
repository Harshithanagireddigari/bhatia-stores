import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    for (const item of allSettings) {
      settingsMap[item.key] = item.value;
    }

    // Default fallbacks
    const responseData = {
      cod_enabled: settingsMap.cod_enabled !== "false",
      free_shipping_threshold: Number(settingsMap.free_shipping_threshold || "5000"),
      standard_shipping_fee: Number(settingsMap.standard_shipping_fee || "299"),
      store_phone: settingsMap.store_phone || "+91 99849 79720",
      store_email: settingsMap.store_email || "contact@bhatiastores.com",
      store_whatsapp: settingsMap.store_whatsapp || "919984979720",
      store_address: settingsMap.store_address || "Bhatia Sanitary & Tiles Showroom, Main Ring Road, Industrial Area, Sector 4, India",
      business_hours: settingsMap.business_hours || "Mon - Sat: 9:30 AM - 8:30 PM | Sunday: 10:30 AM - 6:00 PM",
      cod_min_amount: Number(settingsMap.cod_min_amount || "0"),
      cod_max_amount: Number(settingsMap.cod_max_amount || "50000"),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const payload = await req.json();

    const allowedKeys = [
      "cod_enabled",
      "free_shipping_threshold",
      "standard_shipping_fee",
      "store_phone",
      "store_email",
      "store_whatsapp",
      "store_address",
      "business_hours",
      "cod_min_amount",
      "cod_max_amount",
    ];

    for (const [k, v] of Object.entries(payload)) {
      if (allowedKeys.includes(k)) {
        const valStr = String(v);
        const existing = await db.select().from(settings).where(eq(settings.key, k)).limit(1);
        if (existing[0]) {
          await db.update(settings).set({ value: valStr, updatedAt: new Date() }).where(eq(settings.key, k));
        } else {
          await db.insert(settings).values({ key: k, value: valStr, updatedAt: new Date() });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
