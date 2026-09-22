import { createHash, randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";
import { getUserByEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/order-email";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiFailure, jsonError, jsonResponse, tooManyRequests } from "@/lib/security/http";
import { emailValue, readJsonBody, rejectUnknownKeys } from "@/lib/security/validation";
import { resolveAppOrigin } from "@/lib/security/origin";
import { logServerError } from "@/lib/security/logger";

const genericMessage = "If an account exists for this email, we have sent password reset instructions.";

/**
 * Starts a password reset.
 *
 *  - Identical response whether or not the account exists (no enumeration).
 *  - Only a SHA-256 hash of the token is stored, so a database leak does not
 *    hand out working reset links.
 *  - The link is built from `APP_URL`, never from a request header.
 */
export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ["email"]);
    const email = emailValue(body.email, { field: "Email" });

    const { limited, retryAfterSeconds } = await checkRateLimit(req, "forgot-password", {
      limit: 3,
      windowMs: 15 * 60_000,
      subject: email,
    });
    if (limited) return tooManyRequests(retryAfterSeconds);

    const user = await getUserByEmail(email);
    if (!user) return jsonResponse({ message: genericMessage });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Previous links for this user stop working the moment a new one is issued.
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

    await db.insert(passwordResetTokens).values({
      id: uuidv4(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const origin = resolveAppOrigin(req);
    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl: `${origin}/reset-password?token=${encodeURIComponent(token)}` });
    } catch (error) {
      // Still return the generic message: whether mail delivery works must not
      // be observable from the outside.
      logServerError("auth.forgot-password", error);
    }
    return jsonResponse({ message: genericMessage });
  } catch (error) {
    return apiFailure("auth.forgot-password", error);
  }
}
