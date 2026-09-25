// Resilient Redis Client & Cache Layer
import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

interface RedisConfig {
  url?: string;
  token?: string;
}

function getRedisCredentials(): RedisConfig | null {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url) {
    return { url, token };
  }
  return null;
}

// Low-overhead Upstash REST / HTTP Redis executor
async function redisRestCall(command: string[]): Promise<any> {
  const creds = getRedisCredentials();
  if (!creds || !creds.url) return null;

  try {
    const isRest = creds.url.startsWith("http");
    if (isRest && creds.token) {
      const res = await fetch(`${creds.url}/${command.map(encodeURIComponent).join("/")}`, {
        headers: { Authorization: `Bearer ${creds.token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(500),
      });
      if (res.ok) {
        const json = await res.json();
        return json.result;
      }
    }
  } catch (err) {
    console.warn("Redis REST call error:", err);
  }
  return null;
}

export const redis = {
  async get(key: string): Promise<string | null> {
    const creds = getRedisCredentials();
    if (creds) {
      const result = await redisRestCall(["GET", key]);
      if (result !== null && result !== undefined) return String(result);
    }
    return null;
  },

  async set(key: string, value: string, expireSeconds?: number): Promise<boolean> {
    const creds = getRedisCredentials();
    if (creds) {
      const cmd = expireSeconds ? ["SET", key, value, "EX", String(expireSeconds)] : ["SET", key, value];
      const result = await redisRestCall(cmd);
      return result === "OK" || result === true;
    }
    return false;
  },

  async incr(key: string): Promise<number> {
    const creds = getRedisCredentials();
    if (creds) {
      const result = await redisRestCall(["INCR", key]);
      if (typeof result === "number") return result;
    }
    return 1;
  },

  async expire(key: string, seconds: number): Promise<boolean> {
    const creds = getRedisCredentials();
    if (creds) {
      const result = await redisRestCall(["EXPIRE", key, String(seconds)]);
      return result === 1 || result === true;
    }
    return false;
  },

  async del(key: string): Promise<boolean> {
    const creds = getRedisCredentials();
    if (creds) {
      const result = await redisRestCall(["DEL", key]);
      return result > 0;
    }
    return false;
  },
};

/**
 * Hybrid Rate Limiter: Uses Redis when available, with PostgreSQL fallback
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 15 * 60 * 1000
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const windowSeconds = Math.ceil(windowMs / 1000);
  const now = Date.now();
  const resetAt = now + windowMs;

  const creds = getRedisCredentials();
  if (creds) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      const remaining = Math.max(0, limit - current);
      return {
        success: current <= limit,
        remaining,
        resetAt,
      };
    } catch (err) {
      console.warn("Redis rate-limiting failed, using DB fallback:", err);
    }
  }

  // PostgreSQL DB fallback
  try {
    await db.delete(rateLimits).where(lt(rateLimits.resetAt, new Date()));
    const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);

    if (!existing[0]) {
      await db.insert(rateLimits).values({
        key,
        count: 1,
        resetAt: new Date(resetAt),
      });
      return { success: true, remaining: limit - 1, resetAt };
    }

    if (existing[0].count >= limit) {
      return { success: false, remaining: 0, resetAt: new Date(existing[0].resetAt).getTime() };
    }

    await db
      .update(rateLimits)
      .set({ count: existing[0].count + 1 })
      .where(eq(rateLimits.key, key));

    return {
      success: true,
      remaining: limit - (existing[0].count + 1),
      resetAt: new Date(existing[0].resetAt).getTime(),
    };
  } catch (dbErr) {
    console.error("DB Rate Limiter error:", dbErr);
    return { success: true, remaining: 1, resetAt };
  }
}
