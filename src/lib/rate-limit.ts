import { NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitStore>();

// Clean up expired IP records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memoryStore.entries()) {
    if (now > data.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function isRateLimited(
  req: Request,
  actionKey: string,
  maxAttempts: number = 30,
  windowMs: number = 60 * 1000
): Promise<boolean> {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
  const now = Date.now();
  const storeKey = `${ip}:${actionKey}`;
  const record = memoryStore.get(storeKey);

  if (!record || now > record.resetTime) {
    memoryStore.set(storeKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count += 1;
  return false;
}

export function rateLimit(
  req: Request,
  limit: number = 60,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

  const now = Date.now();
  const key = `${ip}:${new URL(req.url).pathname}`;
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}

export function enforceRateLimit(req: Request, limit: number = 30, windowMs: number = 60 * 1000) {
  const result = rateLimit(req, limit, windowMs);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Server protection active.",
        retryAfterSeconds: result.reset,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.reset),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }
  return null;
}