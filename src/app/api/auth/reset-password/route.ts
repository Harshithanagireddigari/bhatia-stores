import { createHash } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, sessions } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiFailure, jsonError, jsonResponse, tooManyRequests } from "@/lib/security/http";
import { assertPasswordPolicy, readJsonBody, rejectUnknownKeys, requiredText } from "@/lib/security/validation";

/**
 * Completes a password reset.
 *
 *  - Token is single-use and expires after an hour; only its hash is stored.
 *  - A new password also invalidates every existing session for that account,
 *    so a stolen cookie stops working the moment the owner resets.
 */
export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ["token", "password", "confirmPassword"]);
    const token = requiredText(body.token, { field: "Reset link", max: 200 });
    const password = assertPasswordPolicy(body.password);
    if (typeof body.confirmPassword !== "string" || password !== body.confirmPassword) {
      return jsonError("Passwords do not match.");
    }

    const { limited, retryAfterSeconds } = await checkRateLimit(req, "reset-password", { limit: 5, windowMs: 15 * 60_000 });
    if (limited) return tooManyRequests(retryAfterSeconds);

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const reset = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())))
      .limit(1);
    if (!reset[0]) return jsonError("This reset link is invalid or has expired. Please request a new one.");

    const passwordHash = await hashPassword(password);
    await db.transaction(async (tx) => {
      const used = await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(and(eq(passwordResetTokens.id, reset[0].id), isNull(passwordResetTokens.usedAt)))
        .returning({ id: passwordResetTokens.id });
      if (!used[0]) throw new Error("Reset link already used");
      await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(and(eq(passwordResetTokens.userId, reset[0].userId), isNull(passwordResetTokens.usedAt)));
      await tx.delete(sessions).where(eq(sessions.userId, reset[0].userId));
    });

    return jsonResponse({ message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    return apiFailure("auth.reset-password", error);
  }
}
