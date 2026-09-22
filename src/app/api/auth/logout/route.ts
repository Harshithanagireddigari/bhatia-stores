import { clearSession } from "@/lib/auth";
import { apiFailure, jsonResponse } from "@/lib/security/http";

/** Deletes the session row server-side as well as the browser cookie. */
export async function POST() {
  try {
    await clearSession();
    return jsonResponse({ success: true });
  } catch (error) {
    return apiFailure("auth.logout", error);
  }
}
