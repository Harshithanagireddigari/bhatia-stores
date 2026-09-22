import { NextResponse } from "next/server";
import { ValidationError } from "./validation";
import { logServerError } from "./logger";

/**
 * Response helpers for the API routes.
 *
 * Two guarantees:
 *  1. Nothing user-specific is cacheable by a browser, proxy, or CDN.
 *  2. The client only ever receives a short, generic message. Stack traces,
 *     driver errors and configuration details stay in the server log.
 */

const GENERIC_ERROR = "Something went wrong. Please try again.";

const baseHeaders: Record<string, string> = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  Vary: "Cookie, Origin",
};

export function jsonResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: baseHeaders });
}

export function jsonError(message: string, status = 400): NextResponse {
  return jsonResponse({ error: message }, status);
}

export function unauthorized(): NextResponse {
  return jsonError("You need to sign in to continue.", 401);
}

export function forbidden(): NextResponse {
  return jsonError("You do not have access to this.", 403);
}

export function notFound(what = "resource"): NextResponse {
  return jsonError(`${what} not found`, 404);
}

export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many attempts. Please try again later." },
    { status: 429, headers: { ...baseHeaders, "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) } }
  );
}

/**
 * Maps a thrown value onto a client response and logs the detail server-side.
 * Only `ValidationError` messages are echoed back, because those are the ones
 * this codebase wrote for an end user to read.
 */
export function apiFailure(scope: string, error: unknown): NextResponse {
  if (error instanceof ValidationError) return jsonError(error.message, error.status);
  logServerError(scope, error);
  return jsonError(GENERIC_ERROR, 500);
}
