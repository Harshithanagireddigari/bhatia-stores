import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth";
import { createOtpChallenge } from "@/lib/otp";
import { sendLoginOtpEmail } from "@/lib/order-email";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "forgot-password", 5, 15 * 60_000)) {
      return NextResponse.json({ error: "Please wait before requesting another OTP." }, { status: 429 });
    }
    const { email } = await req.json();
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Enter your registered email address." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await getUserByEmail(cleanEmail);

    const challenge = await createOtpChallenge(cleanEmail);
    await sendLoginOtpEmail({
      to: cleanEmail,
      name: user?.name,
      otpCode: challenge.code,
    });

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: `We've sent a 6-digit one-time code to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (error) {
    console.error("Forgot password OTP error:", error);
    return NextResponse.json({ error: "Unable to send login OTP. Please try again." }, { status: 500 });
  }
}
