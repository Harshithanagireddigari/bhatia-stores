import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const list = await db.select().from(offers).orderBy(desc(offers.createdAt));
    return NextResponse.json(Array.isArray(list) ? list : []);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, code, discountType, discountValue, expiresAt } = await request.json();
    if (!title || !Number(discountValue)) {
      return NextResponse.json({ error: "Title and discount are required" }, { status: 400 });
    }

    const id = uuidv4();
    await db.insert(offers).values({
      id,
      title,
      code: code ? code.trim().toUpperCase() : null,
      discountType: discountType === "flat" ? "flat" : "percent",
      discountValue: String(discountValue),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "Could not create offer" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isActive } = await request.json();
    await db.update(offers).set({ isActive: isActive ? 1 : 0 }).where(eq(offers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.delete(offers).where(eq(offers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
