import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "reset_password", 10, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const { token, password, confirmPassword } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const outcome = await resetPasswordWithToken(token, password);

    if (!outcome.success) {
      return NextResponse.json({ error: outcome.error || "Password reset failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! Please sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Server error occurred. Please try again." }, { status: 500 });
  }
}
