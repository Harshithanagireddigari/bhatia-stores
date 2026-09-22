import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { forbidden, unauthorized } from "./http";

/**
 * Authorisation gates. Every privileged route calls one of these *before* it
 * touches the request body, so the server never relies on the browser hiding a
 * button. Hiding the admin UI is cosmetic; this is what actually enforces it.
 */

export type AuthGate = { ok: true; user: SessionUser } | { ok: false; response: NextResponse };

export async function requireUser(): Promise<AuthGate> {
  const user = await getSessionUser();
  if (!user) return { ok: false, response: unauthorized() };
  return { ok: true, user };
}

export async function requireAdmin(): Promise<AuthGate> {
  const user = await getSessionUser();
  if (!user) return { ok: false, response: unauthorized() };
  if (user.role !== "admin") return { ok: false, response: forbidden() };
  return { ok: true, user };
}

/** The public shape of a user. Never include the password hash or session id. */
export function publicUser(user: SessionUser) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
