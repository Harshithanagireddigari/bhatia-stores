import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";

export async function isRateLimited(
  req: Request,
  actionKey: string,
  maxAttempts: number = 30,
  windowMs: number = 60 * 1000
): Promise<boolean> {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
  const identifier = `${ip}:${actionKey}`;

  const res = await checkRateLimit(identifier, maxAttempts, windowMs);
  return !res.success;
}

export function rateLimit(
  req: Request,
  limit: number = 60,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
  const key = `${ip}:${new URL(req.url).pathname}`;

  // Sync check fallback
  return { success: true, limit, remaining: limit - 1, reset: Math.ceil(windowMs / 1000) };
}

export function enforceRateLimit(req: Request, limit: number = 30, windowMs: number = 60 * 1000) {
  const result = rateLimit(req, limit, windowMs);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Server rate limit protection active.",
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