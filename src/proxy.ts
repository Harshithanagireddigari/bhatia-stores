import { NextResponse, type NextRequest } from "next/server";
import { createNonce, securityHeaders } from "@/lib/security/headers";
import { isSameOriginRequest } from "@/lib/security/origin";

/**
 * Request proxy (Next 16 replaces `middleware.ts` with `proxy.ts`).
 *
 * Runs on every request and does two jobs:
 *
 *  1. Security headers, including a Content-Security-Policy with a fresh
 *     per-request nonce. The nonce is forwarded on the *request* headers as
 *     well, which is how the renderer authorises its own inline bootstrap
 *     scripts without needing `'unsafe-inline'`.
 *  2. Same-origin enforcement for state-changing API calls. The session cookie
 *     is `SameSite=strict`; this is the independent second layer that rejects a
 *     cross-site POST before it reaches a route handler.
 *
 * No `Access-Control-Allow-Origin` is ever sent: this API is same-origin only.
 */

const PRODUCTION = process.env.NODE_ENV === "production";
const DANGEROUS_PATH = /[\0]|%00|\.\.|\/\.\//;

function blocked(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (DANGEROUS_PATH.test(pathname) || DANGEROUS_PATH.test(request.url)) {
    return blocked("Invalid request path.", 400);
  }

  if (pathname.startsWith("/api/") && !isSameOriginRequest(request)) {
    return blocked("Cross-origin requests are not allowed.", 403);
  }

  const nonce = createNonce();
  const headers = securityHeaders(nonce, PRODUCTION);

  const requestHeaders = new Headers(request.headers);
  for (const header of headers) requestHeaders.set(header.key, header.value);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const header of headers) response.headers.set(header.key, header.value);
  // Belt and braces: never let a platform default advertise the framework.
  response.headers.delete("X-Powered-By");
  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except build output and static files: the headers are meant
     * for documents and API responses, not for the immutable JS/CSS bundles or
     * the catalogue images.
     */
    "/((?!_next/static|_next/image|favicon.ico|products/|.*\\.(?:jpg|jpeg|png|webp|gif|svg|ico|txt|xml|webmanifest)$).*)",
  ],
};
