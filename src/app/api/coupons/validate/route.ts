import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, orders } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { code, cartSubtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const user = await getSessionUser();

    const couponList = await db.select().from(coupons).where(eq(coupons.code, cleanCode));

    if (couponList.length === 0) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const coupon = couponList[0];

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is currently inactive" }, { status: 400 });
    }

    // Expiry Check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Usage Limit Check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon usage limit has been reached" }, { status: 400 });
    }

    // Minimum Order Amount Check
    const minAmount = Number(coupon.minOrderAmount || 0);
    const subtotal = Number(cartSubtotal || 0);

    if (subtotal < minAmount) {
      return NextResponse.json(
        { error: `This coupon requires a minimum order amount of ₹${minAmount.toLocaleString("en-IN")}` },
        { status: 400 }
      );
    }

    // First Order Only Check
    if (coupon.isFirstOrderOnly) {
      if (!user) {
        return NextResponse.json(
          { error: "Please sign in to use this first-order coupon" },
          { status: 401 }
        );
      }

      const previousOrders = await db.select().from(orders).where(eq(orders.userId, user.id));
      if (previousOrders.length > 0) {
        return NextResponse.json(
          { error: "This coupon code is valid for first-time orders only" },
          { status: 400 }
        );
      }
    }

    // Calculate Discount
    let discount = 0;
    const value = Number(coupon.discountValue);

    if (coupon.discountType === "percentage") {
      discount = (subtotal * value) / 100;
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discount = value;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discount,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Could not validate coupon" }, { status: 500 });
  }
}
