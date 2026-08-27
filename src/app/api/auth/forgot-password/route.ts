import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "forgot_password", 5, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many reset attempts. Please try again later." }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const token = await createPasswordResetToken(email);

    if (token) {
      const resetLink = `/reset-password?token=${token}`;
      console.log(`[Security] Password reset requested for ${email}. Secure Link: ${resetLink}`);
    }

    // Always respond with success so email existence is not exposed
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email address, a password reset link has been dispatched.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Server error occurred. Please try again." }, { status: 500 });
  }
}
