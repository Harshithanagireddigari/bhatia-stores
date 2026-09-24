import { NextResponse } from "next/server";
import { getSessionUser, verifyPassword, clearSession } from "@/lib/auth";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { password } = await req.json().catch(() => ({ password: "" }));
    if (!password) {
      return NextResponse.json({ error: "Password confirmation is required to delete your account." }, { status: 400 });
    }

    // Fetch full user record to verify password
    const userRecords = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const userRecord = userRecords[0];

    if (!userRecord) {
      return NextResponse.json({ error: "User record not found." }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(password, userRecord.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect password. Account deletion cancelled." }, { status: 400 });
    }

    // 1. Delete all active sessions
    await db.delete(sessions).where(eq(sessions.userId, user.id));

    // 2. Delete user account record
    await db.delete(users).where(eq(users.id, user.id));

    // 3. Clear session cookie
    await clearSession();

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account. Please try again." }, { status: 500 });
  }
}
