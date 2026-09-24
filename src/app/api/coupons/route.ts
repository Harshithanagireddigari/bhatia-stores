import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { and, eq, gte, isNull, or } from "drizzle-orm";

export async function GET() {
  try {
    const now = new Date();
    const activeOffers = await db
      .select({
        id: offers.id,
        title: offers.title,
        code: offers.code,
        discountType: offers.discountType,
        discountValue: offers.discountValue,
        expiresAt: offers.expiresAt,
      })
      .from(offers)
      .where(
        and(
          eq(offers.isActive, 1),
          or(isNull(offers.expiresAt), gte(offers.expiresAt, now))
        )
      );

    return NextResponse.json(activeOffers);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    const result = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.code, cleanCode),
          eq(offers.isActive, 1),
          or(isNull(offers.expiresAt), gte(offers.expiresAt, now))
        )
      )
      .limit(1);

    if (!result[0]) {
      return NextResponse.json(
        { error: "Invalid or expired coupon code" },
        { status: 404 }
      );
    }

    const offer = result[0];
    return NextResponse.json({
      valid: true,
      id: offer.id,
      title: offer.title,
      code: offer.code,
      discountType: offer.discountType,
      discountValue: Number(offer.discountValue),
    });
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
