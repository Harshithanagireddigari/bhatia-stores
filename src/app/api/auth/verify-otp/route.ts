import { getUserByEmail, setSessionCookie } from "@/lib/auth";
import { verifyOtpAnswer, otpLoginEnabled } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiFailure, jsonError, jsonResponse, notFound, tooManyRequests } from "@/lib/security/http";
import { publicUser } from "@/lib/security/guards";
import { emailValue, readJsonBody, rejectUnknownKeys } from "@/lib/security/validation";

/**
 * OTP sign-in.
 *
 * Disabled unless `ENABLE_OTP_LOGIN=true`: a passwordless endpoint that signs
 * in any address it is given is too dangerous to leave reachable. When it is
 * disabled the route answers 404, so it does not advertise itself.
 */
export async function POST(req: Request) {
  if (!otpLoginEnabled()) return notFound();

  try {
    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ["email", "otp"]);
    const email = emailValue(body.email, { field: "Email" });

    const { limited, retryAfterSeconds } = await checkRateLimit(req, "verify-otp", {
      limit: 5,
      windowMs: 15 * 60_000,
      subject: email,
    });
    if (limited) return tooManyRequests(retryAfterSeconds);

    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    if (!(await verifyOtpAnswer(email, otp))) {
      return jsonError("Invalid or expired OTP");
    }

    const user = await getUserByEmail(email);
    if (!user) return notFound("Account");

    await setSessionCookie(user.id);
    return jsonResponse({ success: true, user: publicUser(user) });
  } catch (error) {
    return apiFailure("auth.verify-otp", error);
  }
}
