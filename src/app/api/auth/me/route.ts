import { getSessionUser } from "@/lib/auth";
import { jsonResponse } from "@/lib/security/http";
import { publicUser } from "@/lib/security/guards";

/** Returns only the public profile shape, never a session id or password hash. */
export async function GET() {
  const user = await getSessionUser();
  return jsonResponse({ user: user ? publicUser(user) : null });
}
