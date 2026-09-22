import { db } from "@/db";
import { orders, orderItems, paymentOrders, products } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, eq, gt, inArray } from "drizzle-orm";
import { createHmac } from "node:crypto";
import { safeEqual } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendOrderNotifications } from "@/lib/order-email";
import { requireUser } from "@/lib/security/guards";
import { apiFailure, jsonError, jsonResponse, tooManyRequests } from "@/lib/security/http";
import {
  emailValue,
  oneOf,
  optionalText,
  phoneValue,
  readJsonBody,
  rejectUnknownKeys,
  requiredText,
  ValidationError,
} from "@/lib/security/validation";
import { MAX_ITEMS_PER_REQUEST, parseCartQuantity } from "@/lib/product-input";
import { logServerError } from "@/lib/security/logger";

const ORDER_FIELDS = [
  "items",
  "customerName",
  "customerEmail",
  "address",
  "city",
  "phone",
  "paymentMethod",
  "razorpayPaymentId",
  "razorpayOrderId",
  "razorpaySignature",
] as const;

/**
 * Order list. A customer's view is restricted in SQL, so the database never
 * even returns another customer's rows to this handler.
 */
export async function GET() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const query =
    gate.user.role === "customer"
      ? db.select().from(orders).where(eq(orders.userId, gate.user.id)).orderBy(orders.createdAt)
      : db.select().from(orders).orderBy(orders.createdAt);

  return jsonResponse(await query);
}

/**
 * Creates an order.
 *
 * Nothing about the money is taken on trust: products are re-read from the
 * database, quantities are checked against live stock, and the total is
 * recomputed here. A prepaid order is additionally matched against the stored
 * Razorpay intent (amount, currency and exact line items) and the signature is
 * verified with a constant-time comparison before the payment is re-checked
 * with Razorpay itself.
 */
export async function POST(req: Request) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  try {
    const { limited, retryAfterSeconds } = await checkRateLimit(req, "order", {
      limit: 10,
      windowMs: 15 * 60_000,
      subject: user.id,
    });
    if (limited) return tooManyRequests(retryAfterSeconds);

    const body = await readJsonBody(req);
    rejectUnknownKeys(body, ORDER_FIELDS);

    const customerName = requiredText(body.customerName, { field: "Name", max: 120 });
    const customerEmail = emailValue(body.customerEmail, { field: "Email" });
    const address = requiredText(body.address, { field: "Address", max: 400 });
    const city = optionalText(body.city, { field: "City", max: 80 });
    const phone = phoneValue(body.phone);
    const paymentMethod = oneOf(body.paymentMethod, ["razorpay", "cod"] as const, "Payment method");

    if (!Array.isArray(body.items) || !body.items.length || body.items.length > MAX_ITEMS_PER_REQUEST) {
      throw new ValidationError("Your cart is empty or too large.");
    }
    const rawItems = body.items as Array<Record<string, unknown>>;
    const ids = rawItems.map((item) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== rawItems.length || new Set(ids).size !== ids.length) {
      return jsonError("Invalid cart");
    }

    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== rawItems.length) return jsonError("A product is no longer available");

    const verifiedItems = rawItems.map((item) => {
      const product = catalog.find((entry) => entry.id === item.productId)!;
      return { product, quantity: parseCartQuantity(item.quantity, product.stock) };
    });

    // Recomputed from database prices — never from the request body.
    const total = verifiedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    let razorpayPaymentId: string | undefined;
    let razorpayOrderId: string | undefined;

    if (paymentMethod === "razorpay") {
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      if (!razorpaySecret || !razorpayKeyId) return jsonError("Payments are not configured", 503);
      if (typeof body.razorpayOrderId !== "string" || typeof body.razorpayPaymentId !== "string" || typeof body.razorpaySignature !== "string") {
        return jsonError("Payment verification failed");
      }
      razorpayPaymentId = body.razorpayPaymentId;
      razorpayOrderId = body.razorpayOrderId;

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
        return jsonError("Payment does not match this checkout");
      }
      const expectedItems = intent[0].items as Array<{ productId: string; quantity: number; price: string }>;
      const hasMatchingItems =
        expectedItems.length === verifiedItems.length &&
        expectedItems.every((item) =>
          verifiedItems.some((current) => current.product.id === item.productId && current.quantity === item.quantity && current.product.price === item.price)
        );
      if (!hasMatchingItems) return jsonError("Payment does not match this checkout");

      const expected = createHmac("sha256", razorpaySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      if (!safeEqual(body.razorpaySignature, expected)) return jsonError("Payment verification failed");

      // Verify with Razorpay as well, so a signature cannot be replayed for a
      // different amount or order.
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret });
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      if (
        payment.order_id !== razorpayOrderId ||
        payment.amount !== intent[0].amountPaise ||
        payment.currency !== intent[0].currency ||
        !["authorized", "captured"].includes(payment.status)
      ) {
        return jsonError("Payment verification failed");
      }
    }

    const orderId = uuidv4();

    await db.transaction(async (tx) => {
      if (paymentMethod === "razorpay") {
        const consumed = await tx
          .update(paymentOrders)
          .set({ status: "paid", razorpayPaymentId })
          .where(and(eq(paymentOrders.razorpayOrderId, razorpayOrderId!), eq(paymentOrders.status, "created")))
          .returning({ id: paymentOrders.id });
        if (!consumed[0]) throw new ValidationError("Payment has already been used");
      }
      await tx.insert(orders).values({
        id: orderId,
        userId: user.id,
        customerName,
        customerEmail,
        address,
        city,
        phone,
        status: "pending",
        total: total.toFixed(2),
        razorpayPaymentId: paymentMethod === "cod" ? "cash_on_delivery" : razorpayPaymentId!,
        razorpayOrderId: paymentMethod === "cod" ? null : razorpayOrderId!,
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
      total: total.toFixed(2),
      paymentMethod,
      address,
      city,
      phone,
      items: verifiedItems.map(({ product, quantity }) => ({ productName: product.name, quantity, price: product.price })),
    }).catch((error) => logServerError("orders.notify", error));

    return jsonResponse(created[0], 201);
  } catch (error) {
    return apiFailure("orders.create", error);
  }
}
