/**
 * Same-origin enforcement for state-changing requests.
 *
 * The session cookie is `SameSite=strict`, which already blocks the common
 * cross-site CSRF case. This is the second, independent layer: browsers always
 * attach an `Origin` (or `Sec-Fetch-Site`) header to a cross-origin request, so
 * a form or `fetch` fired from another site is rejected here before it reaches a
 * route handler.
 *
 * Deliberately *not* implemented with CORS headers: this API never sends
 * `Access-Control-Allow-Origin`, so no other origin can read a response either.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Optional operator-controlled allowlist, e.g. a staging domain. Never reflected. */
export function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function isSameOriginRequest(request: Request): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const headers = request.headers;
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return false;
  }
  const allowlist = allowedOrigins();

  const origin = headers.get("origin");
  if (origin) return origin === url.origin || allowlist.includes(origin);

  const referer = headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return refererOrigin === url.origin || allowlist.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  // Browsers that send neither header still send Sec-Fetch-Site.
  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";

  // No browser-supplied context at all: a server-to-server caller, which cannot
  // carry the user's session cookie and must authenticate some other way.
  return true;
}

/**
 * Base URL for links we email out (password reset).
 *
 * `APP_URL` wins, so a forged `Host` header can never point a reset link at an
 * attacker's domain. Without it we fall back to the request origin, or to the
 * first configured allowed origin if the request origin is not one we know.
 */
export function resolveAppOrigin(request: Request): string {
  const configured = (process.env.APP_URL ?? "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  let origin: string;
  try {
    origin = new URL(request.url).origin;
  } catch {
    throw new Error("APP_URL must be set to build absolute links");
  }
  const allowlist = allowedOrigins();
  if (allowlist.length && !allowlist.includes(origin)) return allowlist[0];
  return origin;
}
