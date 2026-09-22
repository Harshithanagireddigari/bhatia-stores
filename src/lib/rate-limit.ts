import { createHash } from "node:crypto";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Database-backed rate limiting.
 *
 * The bucket key is a SHA-256 hash of `scope|client|subject`, so the
 * `rate_limits` table never stores an email address, an IP, or any other
 * personal value in plain text.
 */

function clientAddress(request: Request) {
  if (process.env.TRUST_PROXY === "true") {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    );
  }
  return "shared";
}

function bucketKey(scope: string, request: Request, subject?: string) {
  const raw = `${scope}|${clientAddress(request)}|${(subject ?? "").trim().toLowerCase()}`;
  return createHash("sha256").update(raw).digest("hex");
}

export type RateLimitResult = { limited: boolean; retryAfterSeconds: number };

export async function checkRateLimit(
  request: Request,
  scope: string,
  {
    limit = 10,
    windowMs = 60_000,
    subject,
  }: { limit?: number; windowMs?: number; subject?: string } = {}
): Promise<RateLimitResult> {
  const key = bucketKey(scope, request, subject);
  const resetAt = new Date(Date.now() + windowMs);

  const result = await db.execute(sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT (key)
    DO UPDATE SET
      count = CASE
        WHEN rate_limits.reset_at <= NOW() THEN 1
        ELSE rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN rate_limits.reset_at <= NOW() THEN ${resetAt}
        ELSE rate_limits.reset_at
      END
    RETURNING count, reset_at;
  `);

  const row = result.rows[0] as { count: number; reset_at: string | Date } | undefined;
  if (!row) return { limited: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  const retryAfterSeconds = Math.max(0, Math.ceil((new Date(row.reset_at).getTime() - Date.now()) / 1000));
  return { limited: Number(row.count) > limit, retryAfterSeconds };
}

/** Convenience wrapper for call sites that only need a yes/no. */
export async function isRateLimited(
  request: Request,
  scope: string,
  limit = 10,
  windowMs = 60_000
) {
  const { limited } = await checkRateLimit(request, scope, { limit, windowMs });
  return limited;
}

/** Housekeeping: drops expired buckets so the table cannot grow forever. */
export async function pruneRateLimits() {
  await db.execute(sql`DELETE FROM rate_limits WHERE reset_at <= NOW()`);
}
