import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const CAPTCHA_COOKIE = "bhatia_captcha";
const CAPTCHA_MAX_AGE = 5 * 60;

type CaptchaPayload = {
  answer: number;
  expiresAt: number;
  nonce: string;
};

function getSecret() {
  const secret = process.env.CAPTCHA_SECRET || process.env.DATABASE_URL;
  return secret || "bhatia-captcha-fallback-secret-2026";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export async function createCaptchaChallenge() {
  const first = Math.floor(Math.random() * 8) + 1;
  const second = Math.floor(Math.random() * 8) + 1;
  const payload: CaptchaPayload = {
    answer: first + second,
    expiresAt: Date.now() + CAPTCHA_MAX_AGE * 1000,
    nonce: randomBytes(16).toString("hex"),
  };
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(CAPTCHA_COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CAPTCHA_MAX_AGE,
  });

  return { question: `What is ${first} + ${second}?` };
}

export async function verifyCaptchaAnswer(answer: unknown) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CAPTCHA_COOKIE)?.value;
  cookieStore.delete(CAPTCHA_COOKIE);
  if (!token || typeof answer !== "string") return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  const expected = sign(value);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as CaptchaPayload;
    return payload.expiresAt > Date.now() && Number(answer) === payload.answer;
  } catch {
    return false;
  }
}
