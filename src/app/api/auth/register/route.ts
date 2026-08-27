import { NextResponse } from "next/server";
import { createUser, getUserByEmail, setSessionCookie } from "@/lib/auth";
import { verifyCaptchaAnswer } from "@/lib/captcha";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "register", 5, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }
    const { name, email, phone, password, captchaAnswer } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    if (!(await verifyCaptchaAnswer(captchaAnswer))) {
      return NextResponse.json({ error: "Please solve the human verification question." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: "An account is already registered with this email address." }, { status: 409 });
    }

    const user = await createUser(name.trim(), cleanEmail, password, phone?.trim(), "customer");
    await setSessionCookie(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
