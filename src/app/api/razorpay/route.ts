import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { db } from "@/db";
import { products } from "@/db/schema";
import { paymentOrders } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (await isRateLimited(req, "checkout", 10, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
    }
    const { items } = await req.json();
    const currency = "INR";
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "A non-empty cart is required" }, { status: 400 });
    }
    const ids = items.map((item: any) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== items.length || new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }
    const catalog: any[] = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== items.length) return NextResponse.json({ error: "A product is no longer available" }, { status: 400 });
    const verifiedItems = items.map((item: any) => {
      const product = catalog.find((entry: any) => entry.id === item.productId)!;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) throw new Error("Invalid cart quantity");
      return { productId: product.id, productName: product.name, quantity, price: product.price };
    });
    const amount = verifiedItems.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      // In sandbox/local, return a mock orderId for prepaid checkout flow testing
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        keyId: "mock_key_prepaid",
      });
    }

    // Dynamic import to avoid build-time errors
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const paymentOrderId = uuidv4();
    const amountPaise = Math.round(amount * 100);
    const options = {
      amount: amountPaise,
      currency,
      receipt: `receipt_${paymentOrderId}`,
    };

    const order = await razorpay.orders.create(options);
    await db.insert(paymentOrders).values({
      id: paymentOrderId,
      razorpayOrderId: order.id,
      userId: user.id,
      amountPaise,
      currency,
      items: verifiedItems,
      expiresAt: new Date(Date.now() + 30 * 60_000),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
