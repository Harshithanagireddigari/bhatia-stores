// OTP utility – server-only implementation.
//
// Threat model: the challenge cookie lives in the browser, so anything stored
// inside it must be treated as readable by the user (and by any injected
// script). The code is therefore never placed in the cookie — only a keyed
// HMAC of it is, which cannot be reversed into the code. The code itself is
// delivered out of band; if no delivery channel is configured the challenge is
// not issued at all, and it is never written to a log.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { logMissingConfig, logServerEvent } from "@/lib/security/logger";

const OTP_COOKIE = "bhatia_otp";
const OTP_MAX_AGE = 5 * 60; // 5 minutes

function getSecret() {
  const secret = process.env.OTP_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("OTP_SECRET is required");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function hashCode(identifier: string, code: string) {
  return createHmac("sha256", getSecret()).update(`${identifier.toLowerCase()}|${code}`).digest("hex");
}

/** OTP login is opt-in: without a delivery channel there is nothing to verify. */
export function otpLoginEnabled() {
  return process.env.ENABLE_OTP_LOGIN === "true";
}

/**
 * Create an OTP challenge for the given identifier (e.g. email or phone).
 * Throws when no delivery channel is configured, so the code can never fall
 * back to being printed somewhere.
 */
export async function createOtpChallenge(identifier: string) {
  if (!otpLoginEnabled()) {
    logMissingConfig("otp", "ENABLE_OTP_LOGIN");
    throw new Error("OTP login is disabled");
  }
  const code = String(cryptoRandomInt(100_000, 999_999));
  const payload = {
    identifier: identifier.toLowerCase(),
    codeHash: hashCode(identifier, code),
    expiresAt: Date.now() + OTP_MAX_AGE * 1000,
  };
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${value}.${sign(value)}`;

  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: OTP_MAX_AGE,
  });

  await deliverOtp(identifier, code);
  logServerEvent("otp", "Challenge issued", { identifierLength: identifier.length });
  return { success: true };
}

/** Verify the supplied OTP against the signed cookie. One attempt per cookie. */
export async function verifyOtpAnswer(identifier: string, otp: string) {
  if (!otpLoginEnabled()) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(OTP_COOKIE)?.value;
  // Delete the cookie after any verification attempt – one-time use.
  cookieStore.delete(OTP_COOKIE);
  if (!token || typeof otp !== "string" || !/^\d{6}$/.test(otp)) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;
  const expected = sign(value);
  if (!safeCompare(signature, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as {
      identifier: string;
      codeHash: string;
      expiresAt: number;
    };
    if (typeof payload.identifier !== "string" || typeof payload.codeHash !== "string") return false;
    if (payload.identifier !== identifier.toLowerCase()) return false;
    if (typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) return false;
    return safeCompare(payload.codeHash, hashCode(identifier, otp));
  } catch {
    return false;
  }
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function cryptoRandomInt(min: number, max: number) {
  const span = max - min + 1;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return min + (bytes[0] % span);
}

/**
 * Delivery hook. Wire this to Twilio, MSG91, or Resend before enabling OTP
 * login; it intentionally refuses to run without a configured provider.
 */
async function deliverOtp(to: string, code: string) {
  const endpoint = process.env.OTP_DELIVERY_WEBHOOK;
  if (!endpoint) {
    logMissingConfig("otp", "OTP_DELIVERY_WEBHOOK");
    throw new Error("No OTP delivery channel is configured");
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, code }),
  });
  if (!response.ok) throw new Error(`OTP delivery failed with status ${response.status}`);
}
