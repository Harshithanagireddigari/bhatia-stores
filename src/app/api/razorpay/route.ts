import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/db";
import { paymentOrders, products } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiFailure, jsonError, jsonResponse, tooManyRequests } from "@/lib/security/http";
import { readJsonBody, rejectUnknownKeys, ValidationError } from "@/lib/security/validation";
import { MAX_ITEMS_PER_REQUEST, parseCartQuantity } from "@/lib/product-input";
import { logServerError } from "@/lib/security/logger";

/**
 * Creates the Razorpay order for a checkout.
 *
 * The amount is computed here from database prices, and the exact line items
 * are stored with the intent so the confirm step can prove the paid amount
 * matches what is being ordered. Only the *publishable* key id is returned to
 * the browser; the key secret never leaves the server.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return jsonError("You need to sign in to continue.", 401);

    const { limited, retryAfterSeconds } = await checkRateLimit(req, "checkout", {
      limit: 10,
      windowMs: 15 * 60_000,
      subject: user.id,
    });
    if (limited) return tooManyRequests(retryAfterSeconds);

    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ["items"]);
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS_PER_REQUEST) {
      return jsonError("A non-empty cart is required");
    }

    const rawItems = body.items as Array<Record<string, unknown>>;
    const ids = rawItems.map((item) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== rawItems.length || new Set(ids).size !== ids.length) return jsonError("Invalid cart");

    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== rawItems.length) return jsonError("A product is no longer available");

    const verifiedItems = rawItems.map((item) => {
      const product = catalog.find((entry) => entry.id === item.productId)!;
      return {
        productId: product.id,
        productName: product.name,
        quantity: parseCartQuantity(item.quantity, product.stock),
        price: product.price,
      };
    });

    const amount = verifiedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    if (!Number.isFinite(amount) || amount <= 0) return jsonError("Invalid amount");

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!keyId || !keySecret) return jsonError("Payments are not configured", 503);

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const paymentOrderId = uuidv4();
    const amountPaise = Math.round(amount * 100);
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${paymentOrderId}`,
    });

    await db.insert(paymentOrders).values({
      id: paymentOrderId,
      razorpayOrderId: order.id,
      userId: user.id,
      amountPaise,
      currency: "INR",
      items: verifiedItems,
      expiresAt: new Date(Date.now() + 30 * 60_000),
    });

    return jsonResponse({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    logServerError("razorpay.create-order", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
