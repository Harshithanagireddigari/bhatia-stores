import { NextResponse } from "next/server";
import { createUser, getUserByEmail, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Google account email and password are required." }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password).trim();
    const cleanName = String(name || cleanEmail.split("@")[0]).trim();

    let user = await getUserByEmail(cleanEmail);
    if (user) {
      // Verify password if user exists
      const isValid = await verifyPassword(cleanPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect password for this Google account." }, { status: 401 });
      }
    } else {
      // Create user with provided password
      await createUser(cleanName, cleanEmail, cleanPassword);
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
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Could not log in with Google" }, { status: 500 });
  }
}
