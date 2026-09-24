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
    const { name, email, password, phone, captchaAnswer } = await req.json();
    
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
    if (typeof phone === 'string' && detectInjectionPatterns(phone)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedEmail = sanitizeEmail(email);
    
    // Strict active email verification check
    const emailParts = sanitizedEmail.split("@");
    if (emailParts.length !== 2 || !emailParts[1].includes(".")) {
      return NextResponse.json({ error: "Please provide a valid active email address." }, { status: 400 });
    }
    const domain = emailParts[1].toLowerCase();
    const fakeDomains = ["asdf.com", "fake.com", "temp.com", "mailinator.com", "dispostable.com", "trashmail.com", "10minutemail.com", "test.com", "qwerty.com"];
    if (fakeDomains.includes(domain)) {
      return NextResponse.json({ error: "Disposable or fake email addresses are not allowed. Please enter your active email address." }, { status: 400 });
    }
    
    // Validate phone number
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const sanitizedPhone = phone ? phone.replace(/\s/g, '') : '';
    if (phone && !phoneRegex.test(sanitizedPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }
    
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

    const user = await createUser(sanitizedName, sanitizedEmail, password, sanitizedPhone, "customer");
    await setSessionCookie(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
