import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Customer ID is required." }, { status: 400 });
    }

    // Invalidate any active sessions for the customer
    await db.delete(sessions).where(eq(sessions.userId, id));

    // Delete the customer record
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: "Customer account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer." },
      { status: 500 }
    );
  }
}
