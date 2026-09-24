import { NextResponse } from "next/server";
import { createUser, getUserByEmail, setSessionCookie } from "@/lib/auth";
import { verifyOtpAnswer } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email address and 6-digit OTP code are required." }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const valid = await verifyOtpAnswer(cleanEmail, cleanOtp);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP code. Please try again." }, { status: 400 });
    }

    let user = await getUserByEmail(cleanEmail);
    if (!user) {
      const nameParts = cleanEmail.split("@")[0].split(/[^a-zA-Z0-9]/).filter(Boolean);
      const formattedName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "Customer";
      const randomPassword = `OtpPass#${Math.floor(100000 + Math.random() * 900000)}`;
      await createUser(formattedName, cleanEmail, randomPassword);
      user = await getUserByEmail(cleanEmail);
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    await setSessionCookie(user.id);
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Server error during OTP verification" }, { status: 500 });
  }
}
