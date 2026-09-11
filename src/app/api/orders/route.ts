import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, paymentOrders } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { and, eq, gt } from "drizzle-orm";
import { inArray } from "drizzle-orm";
import { products } from "@/db/schema";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isRateLimited } from "@/lib/rate-limit";
import { sendOrderNotifications } from "@/lib/order-email";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = db.select().from(orders).orderBy(orders.createdAt);

  if (user.role === "customer") {
    const all = await query;
    return NextResponse.json(all.filter((o) => o.userId === user.id));
  }

  // Admin sees all
  const all = await query;
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (await isRateLimited(req, "order", 10, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many order attempts. Please try again later." }, { status: 429 });
    }
    const { items, customerName, customerEmail, address, city, phone, paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      await req.json();

    if (!Array.isArray(items) || !items.length || !customerName || !customerEmail || !address || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (paymentMethod !== "razorpay" && paymentMethod !== "cod") {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const ids = items.map((item) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== items.length || new Set(ids).size !== ids.length) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== items.length) return NextResponse.json({ error: "A product is no longer available" }, { status: 400 });
    const verifiedItems = items.map((item) => {
      const product = catalog.find((entry) => entry.id === item.productId)!;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) throw new Error("Invalid cart quantity");
      return { product, quantity };
    });
    const total = verifiedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    if (paymentMethod === "razorpay") {
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      if (!razorpaySecret || !razorpayKeyId) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
      if (typeof razorpayOrderId !== "string" || typeof razorpayPaymentId !== "string" || typeof razorpaySignature !== "string") {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
      const intent = await db
        .select()
        .from(paymentOrders)
        .where(and(
          eq(paymentOrders.razorpayOrderId, razorpayOrderId),
          eq(paymentOrders.userId, user.id),
          eq(paymentOrders.status, "created"),
          gt(paymentOrders.expiresAt, new Date()),
        ))
        .limit(1);
      if (!intent[0] || intent[0].amountPaise !== Math.round(total * 100) || intent[0].currency !== "INR") {
        return NextResponse.json({ error: "Payment does not match this checkout" }, { status: 400 });
      }
      const expectedItems = intent[0].items as Array<{ productId: string; quantity: number; price: string }>;
      const hasMatchingItems = expectedItems.length === verifiedItems.length && expectedItems.every((item) =>
        verifiedItems.some((current) => current.product.id === item.productId && current.quantity === item.quantity && current.product.price === item.price),
      );
      if (!hasMatchingItems) return NextResponse.json({ error: "Payment does not match this checkout" }, { status: 400 });

      const expected = createHmac("sha256", razorpaySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      if (razorpaySignature.length !== expected.length || !timingSafeEqual(Buffer.from(razorpaySignature), Buffer.from(expected))) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
      // Verify with Razorpay as well, so a signature cannot be replayed for a different amount or order.
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret });
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      if (
        payment.order_id !== razorpayOrderId ||
        payment.amount !== intent[0].amountPaise ||
        payment.currency !== intent[0].currency ||
        !["authorized", "captured"].includes(payment.status)
      ) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
    }

    const orderId = uuidv4();

    await db.transaction(async (tx) => {
      if (paymentMethod === "razorpay") {
        const consumed = await tx
          .update(paymentOrders)
          .set({ status: "paid", razorpayPaymentId })
          .where(and(eq(paymentOrders.razorpayOrderId, razorpayOrderId), eq(paymentOrders.status, "created")))
          .returning({ id: paymentOrders.id });
        if (!consumed[0]) throw new Error("Payment has already been used");
      }
      await tx.insert(orders).values({
        id: orderId,
        userId: user.id,
        customerName,
        customerEmail,
        address,
        city: city || "",
        phone,
        status: "pending",
        total: total.toString(),
        razorpayPaymentId: paymentMethod === "cod" ? "cash_on_delivery" : razorpayPaymentId,
        razorpayOrderId: paymentMethod === "cod" ? null : razorpayOrderId,
      });

      for (const item of verifiedItems) {
        await tx.insert(orderItems).values({
          id: uuidv4(),
          orderId,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        });
      }
    });

    const created = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    void sendOrderNotifications({
      id: orderId,
      customerName,
      customerEmail,
      phone,
      total: total.toString(),
      paymentMethod,
      address,
      city: city || "",
      phone,
      items: verifiedItems.map(({ product, quantity }) => ({ productName: product.name, quantity, price: product.price })),
    }).catch((error) => console.error("Order notification error:", error));
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
