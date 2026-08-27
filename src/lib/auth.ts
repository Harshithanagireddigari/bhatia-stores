import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, sessions, passwordResetTokens } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const SESSION_COOKIE = "bhatia_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function sessionSecret() {
  return process.env.SESSION_SECRET || "bhatia_luxury_tile_super_secret_key_2026_default";
}

function signSession(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: "admin" | "customer" = "customer"
) {
  const id = uuidv4();
  const hashedPassword = await hashPassword(password);
  await db.insert(users).values({
    id,
    name,
    email: email.toLowerCase(),
    phone: phone || null,
    password: hashedPassword,
    role,
  });
  return { id, name, email, phone, role };
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return result[0] || null;
}

export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getSessionUser(): Promise<{
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "admin" | "customer";
} | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    if (!session?.value) return null;

    const [value, signature] = session.value.split(".");
    if (!value || !signature) return null;
    const expected = signSession(value);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as {
      userId?: string;
      sessionId?: string;
      expiresAt?: number;
    };
    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.sessionId !== "string" ||
      typeof decoded.expiresAt !== "number" ||
      decoded.expiresAt <= Date.now()
    ) {
      return null;
    }
    const sessionRecord = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.id, decoded.sessionId), eq(sessions.userId, decoded.userId), gt(sessions.expiresAt, new Date())))
      .limit(1);
    if (!sessionRecord[0]) return null;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    if (!user[0]) return null;
    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      phone: user[0].phone,
      role: user[0].role as "admin" | "customer",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await db.insert(sessions).values({ id: sessionId, userId, expiresAt });
  const value = Buffer.from(JSON.stringify({ userId, sessionId, expiresAt: expiresAt.getTime() })).toString("base64url");
  const token = `${value}.${signSession(value)}`;
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const [value, signature] = token.split(".");
      if (value && signature) {
        const expected = signSession(value);
        if (signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as { sessionId?: string };
          if (typeof decoded.sessionId === "string") {
            await db.delete(sessions).where(eq(sessions.id, decoded.sessionId));
          }
        }
      }
    } catch {
      // Always clear the browser cookie
    }
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

  await db.insert(passwordResetTokens).values({
    id: uuidv4(),
    userId: user.id,
    token,
    expiresAt,
    used: 0,
  });

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const records = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, 0), gt(passwordResetTokens.expiresAt, new Date())))
    .limit(1);

  if (!records[0]) {
    return { success: false, error: "Invalid or expired password reset link. Please request a new one." };
  }

  const record = records[0];
  const hashedPassword = await hashPassword(newPassword);

  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, record.userId));
  await db.update(passwordResetTokens).set({ used: 1 }).where(eq(passwordResetTokens.id, record.id));

  return { success: true };
}
