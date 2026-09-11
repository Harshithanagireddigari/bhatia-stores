import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";
import { getUserByEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/order-email";
import { isRateLimited } from "@/lib/rate-limit";

const genericMessage = "If an account exists for this email, we have sent password reset instructions.";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "forgot-password", 3, 15 * 60_000)) {
      return NextResponse.json({ error: "Please wait before requesting another reset email." }, { status: 429 });
    }
    const { email } = await req.json();
    if (typeof email !== "string" || !email.trim()) return NextResponse.json({ error: "Enter your email address." }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ message: genericMessage });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await db.insert(passwordResetTokens).values({
      id: uuidv4(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const origin = process.env.APP_URL || new URL(req.url).origin;
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl: `${origin}/reset-password?token=${encodeURIComponent(token)}` });
    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to start password recovery. Please try again." }, { status: 500 });
  }
}
