import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, user.id))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone, street, apartment, locality, city, state, pincode, isDefault } = await req.json();

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json({ error: "Name, phone, street, city, state, and pincode are required" }, { status: 400 });
    }

    const id = uuidv4();
    const shouldDefault = isDefault ? 1 : 0;

    if (shouldDefault === 1) {
      await db.update(addresses).set({ isDefault: 0 }).where(eq(addresses.userId, user.id));
    }

    await db.insert(addresses).values({
      id,
      userId: user.id,
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      apartment: apartment ? apartment.trim() : null,
      locality: locality ? locality.trim() : null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: shouldDefault,
    });

    const created = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
