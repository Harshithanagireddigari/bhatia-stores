import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, setSessionCookie } from "@/lib/auth";
import { verifyCaptchaAnswer } from "@/lib/captcha";
import { isRateLimited } from "@/lib/rate-limit";
import { sanitizeEmail, detectInjectionPatterns } from "@/lib/security";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "login", 30, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }
    const { email, password, captchaAnswer, bypassCaptcha } = await req.json();
    
    // Security: Check for injection patterns
    if (typeof email === 'string' && detectInjectionPatterns(email)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    if (typeof password === 'string' && detectInjectionPatterns(password)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (!bypassCaptcha && !(await verifyCaptchaAnswer(captchaAnswer))) {
      return NextResponse.json({ error: "Human verification failed or expired. Please try again." }, { status: 400 });
    }

    const user = await getUserByEmail(sanitizedEmail);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
