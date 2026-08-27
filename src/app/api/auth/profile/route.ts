import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!record[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: record[0].id,
      name: record[0].name,
      email: record[0].email,
      phone: record[0].phone,
      role: record[0].role,
      createdAt: record[0].createdAt,
    },
  });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        name: name.trim(),
        phone: phone ? String(phone).trim() : null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: name.trim(),
        email: user.email,
        phone: phone ? String(phone).trim() : null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
