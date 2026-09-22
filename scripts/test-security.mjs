import test from "node:test";
import assert from "node:assert/strict";

import {
  requiredText,
  optionalText,
  emailValue,
  phoneValue,
  moneyValue,
  intValue,
  oneOf,
  httpsUrl,
  rejectUnknownKeys,
  assertPasswordPolicy,
  assertNoPrototypePollution,
  disallowScriptInjection,
  disallowCrlf,
  ValidationError,
} from "../src/lib/security/validation.ts";

import {
  buildContentSecurityPolicy,
  securityHeaders,
  createNonce,
} from "../src/lib/security/headers.ts";

import { isSameOriginRequest } from "../src/lib/security/origin.ts";
import { redactSecrets, describeError } from "../src/lib/security/logger.ts";
import { safeEqual } from "../src/lib/security/safe.ts";

test("Security: Content Security Policy", () => {
  const nonce = createNonce();
  assert.ok(nonce.length >= 16);

  const cspProd = buildContentSecurityPolicy({ nonce, production: true });
  // Must include the nonce
  assert.ok(cspProd.includes(`'nonce-${nonce}'`));
  // Must NOT include unsafe-inline or unsafe-eval in production script-src
  assert.ok(!cspProd.includes("'unsafe-inline' 'nonce-"));
  const scriptDirective = cspProd
    .split(";")
    .find((d) => d.trim().startsWith("script-src"));
  assert.ok(scriptDirective);
  assert.ok(!scriptDirective.includes("'unsafe-inline'"));
  assert.ok(!scriptDirective.includes("'unsafe-eval'"));
  // Must disallow framing, plugins, and inline event handlers
  assert.ok(cspProd.includes("frame-ancestors 'none'"));
  assert.ok(cspProd.includes("object-src 'none'"));
  assert.ok(cspProd.includes("script-src-attr 'none'"));

  const headers = securityHeaders(nonce, true);
  const headerMap = Object.fromEntries(headers.map((h) => [h.key, h.value]));
  assert.equal(headerMap["X-Frame-Options"], "DENY");
  assert.equal(headerMap["X-Content-Type-Options"], "nosniff");
  assert.equal(headerMap["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(headerMap["Cross-Origin-Opener-Policy"], "same-origin");
  assert.equal(headerMap["Cross-Origin-Resource-Policy"], "same-origin");
  assert.ok(headerMap["Strict-Transport-Security"].includes("max-age=63072000"));
});

test("Security: Same-Origin enforcement", () => {
  // Safe methods pass
  const getReq = new Request("https://bhatia.com/api/products", { method: "GET" });
  assert.equal(isSameOriginRequest(getReq), true);

  // State-changing method with matching origin passes
  const validPost = new Request("https://bhatia.com/api/orders", {
    method: "POST",
    headers: { origin: "https://bhatia.com" },
  });
  assert.equal(isSameOriginRequest(validPost), true);

  // State-changing method from malicious origin is rejected
  const evilPost = new Request("https://bhatia.com/api/orders", {
    method: "POST",
    headers: { origin: "https://evil-attacker.com" },
  });
  assert.equal(isSameOriginRequest(evilPost), false);

  // State-changing method with evil referer is rejected
  const evilReferer = new Request("https://bhatia.com/api/orders", {
    method: "POST",
    headers: { referer: "https://evil-attacker.com/exploit.html" },
  });
  assert.equal(isSameOriginRequest(evilReferer), false);

  // State-changing method with cross-site sec-fetch-site is rejected
  const crossSite = new Request("https://bhatia.com/api/orders", {
    method: "POST",
    headers: { "sec-fetch-site": "cross-site" },
  });
  assert.equal(isSameOriginRequest(crossSite), false);
});

test("Security: Prototype Pollution Prevention", () => {
  // Direct proto key
  const protoPayload = JSON.parse('{"__proto__": {"admin": true}}');
  assert.throws(() => assertNoPrototypePollution(protoPayload), ValidationError);

  // Nested constructor key
  const constructorPayload = JSON.parse('{"user": {"constructor": {"prototype": {"admin": true}}}}');
  assert.throws(() => assertNoPrototypePollution(constructorPayload), ValidationError);

  // Prototype key in array
  const arrayPayload = JSON.parse('[{"valid": 1}, {"prototype": {"hacked": true}}]');
  assert.throws(() => assertNoPrototypePollution(arrayPayload), ValidationError);

  // Clean object passes
  assert.doesNotThrow(() => assertNoPrototypePollution({ name: "Tile", price: 800, items: [1, 2, 3] }));
});

test("Security: Script & HTML Injection Prevention", () => {
  // Script tags
  assert.throws(() => disallowScriptInjection("<script>alert('xss')</script>", "Name"), ValidationError);
  assert.throws(() => disallowScriptInjection("<SCRIPT SRC='https://evil.com/xss.js'></SCRIPT>", "Name"), ValidationError);

  // javascript: protocol
  assert.throws(() => disallowScriptInjection("javascript:alert(1)", "Link"), ValidationError);
  assert.throws(() => disallowScriptInjection("  javascript : alert(1)", "Link"), ValidationError);

  // Inline event handlers
  assert.throws(() => disallowScriptInjection("<img src='x' onerror=alert(1)>", "Name"), ValidationError);
  assert.throws(() => disallowScriptInjection("<svg onload='alert(1)'>", "Name"), ValidationError);

  // iframes / objects / embeds
  assert.throws(() => disallowScriptInjection("<iframe src='https://evil.com'></iframe>", "Name"), ValidationError);
  assert.throws(() => disallowScriptInjection("<object data='evil.swf'></object>", "Name"), ValidationError);

  // Clean text passes
  assert.doesNotThrow(() => disallowScriptInjection("Beautiful PGVT 600x1200 Glossy Tile", "Name"));
});

test("Security: CRLF & Header Injection Prevention", () => {
  // CRLF injection in single-line text
  assert.throws(() => disallowCrlf("Rahul Sharma\r\nBcc: evil@attacker.com", "Name"), ValidationError);
  assert.throws(() => disallowCrlf("Rahul\nSharma", "Name"), ValidationError);
  assert.throws(() => disallowCrlf("Rahul\rSharma", "Name"), ValidationError);

  // Clean single-line text passes
  assert.doesNotThrow(() => disallowCrlf("Rahul Sharma", "Name"));

  // emailValue rejects newlines
  assert.throws(() => emailValue("user@example.com\r\nBcc:attacker@evil.com"), ValidationError);
  assert.throws(() => emailValue("user@example.com\n"), ValidationError);

  // phoneValue rejects newlines
  assert.throws(() => phoneValue("+919120435950\r\n"), ValidationError);
});

test("Security: Server-Side Input Validation", () => {
  // requiredText
  assert.equal(requiredText("  hello world  ", { field: "Test", max: 50 }), "hello world");
  assert.throws(() => requiredText("", { field: "Test", max: 50 }), ValidationError);
  assert.throws(() => requiredText("a".repeat(51), { field: "Test", max: 50 }), ValidationError);
  assert.throws(() => requiredText("bad\u0000char", { field: "Test", max: 50 }), ValidationError);

  // emailValue
  assert.equal(emailValue("User@Bhatia.COM"), "user@bhatia.com");
  assert.throws(() => emailValue("invalid-email"), ValidationError);
  assert.throws(() => emailValue("user@"), ValidationError);
  assert.throws(() => emailValue("user@domain"), ValidationError);

  // phoneValue
  assert.equal(phoneValue("+91 91204 35950"), "+91 91204 35950");
  assert.throws(() => phoneValue("not a phone"), ValidationError);
  assert.throws(() => phoneValue("123"), ValidationError);

  // moneyValue - never allow NaN, negative or client price tampering
  assert.equal(moneyValue(123.45), "123.45");
  assert.equal(moneyValue("123.4"), "123.40");
  assert.throws(() => moneyValue(-10), ValidationError);
  assert.throws(() => moneyValue(NaN), ValidationError);
  assert.throws(() => moneyValue("invalid"), ValidationError);
  assert.throws(() => moneyValue(10_000_000), ValidationError);

  // intValue
  assert.equal(intValue(5, { field: "Stock", min: 0, max: 10 }), 5);
  assert.equal(intValue("7", { field: "Stock", min: 0, max: 10 }), 7);
  assert.throws(() => intValue(5.5, { field: "Stock" }), ValidationError);
  assert.throws(() => intValue(-1, { field: "Stock", min: 0 }), ValidationError);
  assert.throws(() => intValue(11, { field: "Stock", max: 10 }), ValidationError);

  // oneOf
  assert.equal(oneOf("cod", ["cod", "razorpay"], "Payment"), "cod");
  assert.throws(() => oneOf("bitcoin", ["cod", "razorpay"], "Payment"), ValidationError);

  // httpsUrl - blocks javascript: and unapproved domains
  assert.equal(
    httpsUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
      field: "Image",
      allowedHosts: ["res.cloudinary.com"],
    }),
    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  );
  assert.throws(
    () => httpsUrl("javascript:alert(1)", { field: "Image" }),
    ValidationError
  );
  assert.throws(
    () => httpsUrl("http://unencrypted.com/img.jpg", { field: "Image" }),
    ValidationError
  );
  assert.throws(
    () =>
      httpsUrl("https://evil-site.com/tracking.png", {
        field: "Image",
        allowedHosts: ["res.cloudinary.com"],
      }),
    ValidationError
  );

  // rejectUnknownKeys - prevents mass assignment attacks
  assert.doesNotThrow(() =>
    rejectUnknownKeys({ name: "item", price: 10 }, ["name", "price", "stock"])
  );
  assert.throws(
    () =>
      rejectUnknownKeys({ name: "item", role: "admin" }, ["name", "price"]),
    ValidationError
  );

  // assertPasswordPolicy
  assert.equal(assertPasswordPolicy("SecretP@ssw0rd!"), "SecretP@ssw0rd!");
  assert.throws(() => assertPasswordPolicy("short"), ValidationError);
  assert.throws(() => assertPasswordPolicy("11111111"), ValidationError);
});

test("Security: Logger & Secret Redaction", () => {
  const sensitiveObj = {
    email: "customer@example.com",
    password: "superSecretPassword123",
    apiKey: "ak_live_abcdef123456",
    sessionToken: "sess_xyz789",
    databaseUrl: "postgresql://user:pass@localhost:5432/db",
    cart: [{ name: "Tile 01", price: "800.00" }],
  };

  const redacted = redactSecrets(sensitiveObj);
  assert.equal(redacted.password, "[redacted]");
  assert.equal(redacted.apiKey, "[redacted]");
  assert.equal(redacted.sessionToken, "[redacted]");
  assert.equal(redacted.databaseUrl, "[redacted]");
  assert.equal(redacted.email, "customer@example.com");

  // Stack trace omission in production
  process.env.NODE_ENV = "production";
  const err = new Error("Database connection timeout");
  const desc = describeError(err);
  assert.ok(!desc.includes("\n"));
  assert.ok(desc.includes("Database connection timeout"));
});

test("Security: Constant-time safe string comparison", () => {
  assert.equal(safeEqual("test-secret-12345", "test-secret-12345"), true);
  assert.equal(safeEqual("test-secret-12345", "test-secret-99999"), false);
  assert.equal(safeEqual("short", "much-longer-string"), false);
});
