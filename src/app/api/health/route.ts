import { db } from "@/db";
import { sql } from "drizzle-orm";
import { jsonResponse } from "@/lib/security/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return jsonResponse({ ok: true, status: "healthy" });
  } catch {
    return jsonResponse({ ok: false, status: "unhealthy" }, 500);
  }
}
