/**
 * Security response headers, including the Content-Security-Policy.
 *
 * This module must stay free of `next/*` and Node-only imports: it is imported
 * by `src/proxy.ts` (which runs on every request) and by the unit tests.
 *
 * The CSP is only ever written by the proxy, so there is exactly one policy per
 * response — a second `Content-Security-Policy` header would intersect with
 * this one and could break the app.
 */

export type CspOptions = {
  /** Per-request nonce; allows the framework's own inline bootstrap scripts. */
  nonce: string;
  /** Production gets the strict policy; development keeps HMR working. */
  production: boolean;
};

/**
 * Hosts the storefront is allowed to talk to. Razorpay is needed for checkout
 * and Cloudinary serves the catalogue imagery.
 */
const RAZORPAY = [
  "https://checkout.razorpay.com",
  "https://api.razorpay.com",
  "https://cdn.razorpay.com",
  "https://*.razorpay.com",
];

export function buildContentSecurityPolicy({ nonce, production }: CspOptions): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // No `'unsafe-inline'`: the nonce is what authorises the framework's own
    // bootstrap scripts. Razorpay's checkout script is allowlisted by origin.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "https://checkout.razorpay.com",
      "https://cdn.razorpay.com",
      // React Refresh evaluates code, and that only happens in development.
      ...(production ? [] : ["'unsafe-eval'"]),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.cloudinary.com", ...RAZORPAY],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...(production ? [] : ["ws:", "wss:"]), ...RAZORPAY],
    "frame-src": ["'self'", ...RAZORPAY],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "media-src": ["'self'"],
    // No plugins, no embedding this site in a frame, no forms posting elsewhere.
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  if (production) directives["upgrade-insecure-requests"] = [];

  return Object.entries(directives)
    .map(([name, sources]) => (sources.length ? `${name} ${sources.join(" ")}` : name))
    .join("; ");
}

export type SecurityHeader = { key: string; value: string };

/**
 * Static headers applied by the proxy on every response. `next.config.ts`
 * keeps its own static set for defence in depth; the CSP lives only here
 * because it needs the per-request nonce.
 */
export function securityHeaders(nonce: string, production: boolean): SecurityHeader[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy({ nonce, production }) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
    ...(production
      ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
      : []),
  ];
}

/** Generates a CSP nonce from the platform CSPRNG. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
