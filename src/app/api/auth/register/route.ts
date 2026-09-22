import { NextResponse } from "next/server";
import { createUser, getUserByEmail, setSessionCookie } from "@/lib/auth";
import { verifyCaptchaAnswer } from "@/lib/captcha";
import { isRateLimited } from "@/lib/rate-limit";
import { sanitizeString, sanitizeEmail, detectInjectionPatterns } from "@/lib/security";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "register", 5, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }
    const { name, email, password, captchaAnswer } = await req.json();
    
    // Security: Check for injection patterns
    if (typeof name === 'string' && detectInjectionPatterns(name)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    if (typeof email === 'string' && detectInjectionPatterns(email)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    if (typeof password === 'string' && detectInjectionPatterns(password)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedEmail = sanitizeEmail(email);
    
    if (!sanitizedName || !sanitizedEmail || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (!(await verifyCaptchaAnswer(captchaAnswer))) {
      return NextResponse.json({ error: "Please complete the human verification" }, { status: 400 });
    }

    const existing = await getUserByEmail(sanitizedEmail);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser(sanitizedName, sanitizedEmail, password, "customer");
    await setSessionCookie(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
