import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { name, phone, street, apartment, locality, city, state, pincode, isDefault } = await req.json();

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json({ error: "All required address fields must be provided" }, { status: 400 });
    }

    if (isDefault) {
      await db.update(addresses).set({ isDefault: 0 }).where(eq(addresses.userId, user.id));
    }

    await db
      .update(addresses)
      .set({
        name: name.trim(),
        phone: phone.trim(),
        street: street.trim(),
        apartment: apartment ? apartment.trim() : null,
        locality: locality ? locality.trim() : null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: isDefault ? 1 : 0,
      })
      .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));

    const updated = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    // Set as default
    await db.update(addresses).set({ isDefault: 0 }).where(eq(addresses.userId, user.id));
    await db.update(addresses).set({ isDefault: 1 }).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set default address error:", error);
    return NextResponse.json({ error: "Failed to set default address" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
