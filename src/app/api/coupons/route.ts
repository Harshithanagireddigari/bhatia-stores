import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const query = db.select().from(coupons);
    if (!all) {
      query.where(eq(coupons.isActive, 1));
    }

    const list = await query.orderBy(desc(coupons.createdAt));
    const response = NextResponse.json(Array.isArray(list) ? list : []);
    if (!all) {
      response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    }
    return response;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      isFirstOrderOnly,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      expiryDate,
      isActive,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Coupon code and discount value are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await db.select().from(coupons).where(eq(coupons.code, cleanCode));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const newCoupon = {
      id: `cpn_${uuidv4()}`,
      code: cleanCode,
      discountType: discountType || "percentage",
      discountValue: String(discountValue),
      isFirstOrderOnly: isFirstOrderOnly ? 1 : 0,
      minOrderAmount: minOrderAmount ? String(minOrderAmount) : "0",
      maxDiscountAmount: maxDiscountAmount ? String(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      startDate: startDate ? new Date(startDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
    };

    await db.insert(coupons).values(newCoupon);
    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const formattedUpdates: Record<string, any> = {};
    if (updates.code) formattedUpdates.code = updates.code.trim().toUpperCase();
    if (updates.discountType) formattedUpdates.discountType = updates.discountType;
    if (updates.discountValue !== undefined) formattedUpdates.discountValue = String(updates.discountValue);
    if (updates.isFirstOrderOnly !== undefined) formattedUpdates.isFirstOrderOnly = updates.isFirstOrderOnly ? 1 : 0;
    if (updates.minOrderAmount !== undefined) formattedUpdates.minOrderAmount = String(updates.minOrderAmount || 0);
    if (updates.maxDiscountAmount !== undefined) formattedUpdates.maxDiscountAmount = updates.maxDiscountAmount ? String(updates.maxDiscountAmount) : null;
    if (updates.usageLimit !== undefined) formattedUpdates.usageLimit = updates.usageLimit ? Number(updates.usageLimit) : null;
    if (updates.startDate !== undefined) formattedUpdates.startDate = updates.startDate ? new Date(updates.startDate) : null;
    if (updates.expiryDate !== undefined) formattedUpdates.expiryDate = updates.expiryDate ? new Date(updates.expiryDate) : null;
    if (updates.isActive !== undefined) formattedUpdates.isActive = updates.isActive ? 1 : 0;

    await db.update(coupons).set(formattedUpdates).where(eq(coupons.id, id));
    return NextResponse.json({ message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
