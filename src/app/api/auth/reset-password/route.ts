import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "reset-password", 5, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts. Please request a new reset link." }, { status: 429 });
    const { token, password, confirmPassword } = await req.json();
    if (typeof token !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const reset = await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date()))).limit(1);
    if (!reset[0]) return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });
    const passwordHash = await hashPassword(password);
    await db.transaction(async (tx) => {
      const used = await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(and(eq(passwordResetTokens.id, reset[0].id), isNull(passwordResetTokens.usedAt))).returning({ id: passwordResetTokens.id });
      if (!used[0]) throw new Error("Reset link already used");
      await tx.update(users).set({ password: passwordHash }).where(eq(users.id, reset[0].userId));
    });
    return NextResponse.json({ message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset password. Please request a new link." }, { status: 500 });
  }
}
