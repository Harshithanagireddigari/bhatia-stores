// OTP utility – server-only implementation
// Generates a 6-digit one-time code, stores it in a signed HTTP-only cookie,
// and provides verification logic.

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const OTP_COOKIE = "bhatia_otp";
const OTP_MAX_AGE = 10 * 60; // 10 minutes

function getSecret() {
  return process.env.OTP_SECRET || process.env.SESSION_SECRET || "bhatia-stores-secure-otp-fallback-secret-2026";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

/**
 * Create a 6-digit OTP challenge for the given email or phone.
 */
export async function createOtpChallenge(identifier: string) {
  const code = randomInt(100000, 1000000).toString();
  const payload = {
    identifier: identifier.toLowerCase().trim(),
    code,
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

  return { success: true, code };
}

/** Verify the supplied OTP against the signed cookie. */
export async function verifyOtpAnswer(identifier: string, otp: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(OTP_COOKIE)?.value;
  if (!token) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;
  const expected = sign(value);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as {
      identifier: string;
      code: string;
      expiresAt: number;
    };
    if (payload.identifier !== identifier.toLowerCase().trim()) return false;
    if (payload.expiresAt <= Date.now()) return false;

    // Delete cookie on successful verification
    if (payload.code === otp.trim()) {
      cookieStore.delete(OTP_COOKIE);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
