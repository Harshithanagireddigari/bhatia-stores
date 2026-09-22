import type { NextConfig } from "next";

/**
 * Static security headers.
 *
 * The Content-Security-Policy is intentionally *not* here: it needs a
 * per-request nonce and lives in `src/proxy.ts`. Two CSP headers would
 * intersect and could block the app's own scripts.
 */
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

/** Session-derived data must never be cached by a browser, proxy, or CDN. */
const noStoreHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, max-age=0, must-revalidate",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Vary",
    value: "Cookie, Origin",
  },
];

const nextConfig: NextConfig = {
  // No `X-Powered-By: Next.js` fingerprint in responses.
  poweredByHeader: false,
  // Keep `.map` files out of the production client bundle: they would expose
  // readable source, internal paths, and comments to anyone with DevTools.
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
