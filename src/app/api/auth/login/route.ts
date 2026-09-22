import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, setSessionCookie } from "@/lib/auth";
import { verifyCaptchaAnswer } from "@/lib/captcha";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiFailure, jsonError, jsonResponse, tooManyRequests } from "@/lib/security/http";
import { publicUser } from "@/lib/security/guards";
import { emailValue, readJsonBody, requiredText } from "@/lib/security/validation";

/**
 * Sign-in. Deliberately vague: the same message is returned for an unknown
 * email and a wrong password, so the endpoint cannot be used to enumerate
 * accounts. Throttled per client *and* per account.
 */
export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req);
    const email = emailValue(body.email, { field: "Email" });
    const password = requiredText(body.password, { field: "Password", max: 200 });

    const { limited, retryAfterSeconds } = await checkRateLimit(req, "login", {
      limit: 5,
      windowMs: 15 * 60_000,
      subject: email,
    });
    if (limited) return tooManyRequests(retryAfterSeconds);

    if (!(await verifyCaptchaAnswer(body.captchaAnswer))) {
      return jsonError("Please complete the human verification");
    }

    const user = await getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setSessionCookie(user.id);
    return jsonResponse({ user: publicUser(user) });
  } catch (error) {
    return apiFailure("auth.login", error);
  }
}
