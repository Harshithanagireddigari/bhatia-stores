import { NextResponse } from "next/server";
import { createUser, getUserByEmail, setSessionCookie } from "@/lib/auth";
import { verifyCaptchaAnswer } from "@/lib/captcha";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiFailure, jsonError, jsonResponse, tooManyRequests } from "@/lib/security/http";
import { publicUser } from "@/lib/security/guards";
import { assertPasswordPolicy, emailValue, readJsonBody, rejectUnknownKeys, requiredText } from "@/lib/security/validation";

/**
 * Self-service registration. The role is always `customer`: it is never read
 * from the request, so a crafted body cannot mint an admin account.
 */
export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ["name", "email", "password", "captchaAnswer"]);
    const name = requiredText(body.name, { field: "Name", max: 80 });
    const email = emailValue(body.email, { field: "Email" });
    assertPasswordPolicy(body.password);

    const { limited, retryAfterSeconds } = await checkRateLimit(req, "register", {
      limit: 5,
      windowMs: 15 * 60_000,
      subject: email,
    });
    if (limited) return tooManyRequests(retryAfterSeconds);

    if (!(await verifyCaptchaAnswer(body.captchaAnswer))) {
      return jsonError("Please complete the human verification");
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser(name, email, String(body.password), "customer");
    await setSessionCookie(user.id);
    return jsonResponse({ user: publicUser(user) }, 201);
  } catch (error) {
    return apiFailure("auth.register", error);
  }
}
