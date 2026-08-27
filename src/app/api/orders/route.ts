import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, paymentOrders, products, settings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { and, eq, gt, inArray, desc } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isRateLimited } from "@/lib/rate-limit";
import { sendOrderNotifications } from "@/lib/order-email";
import { sendWhatsAppNotifications } from "@/lib/whatsapp";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "customer") {
    const list: any[] = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    // Attach items to each order
    const allOrderIds = list.map((o: any) => o.id);
    let allItems: any[] = [];
    if (allOrderIds.length > 0) {
      allItems = await db.select().from(orderItems).where(inArray(orderItems.orderId, allOrderIds));
    }

    const ordersWithItems = list.map((ord: any) => ({
      ...ord,
      items: allItems.filter((i: any) => i.orderId === ord.id),
    }));

    return NextResponse.json(ordersWithItems);
  }

  // Admin sees all
  const all: any[] = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const allOrderIds = all.map((o: any) => o.id);
  let allItems: any[] = [];
  if (allOrderIds.length > 0) {
    allItems = await db.select().from(orderItems).where(inArray(orderItems.orderId, allOrderIds));
  }

  const ordersWithItems = all.map((ord: any) => ({
    ...ord,
    items: allItems.filter((i: any) => i.orderId === ord.id),
  }));

  return NextResponse.json(ordersWithItems);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to place your order" }, { status: 401 });
  }

  try {
    if (await isRateLimited(req, "order", 15, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many order requests. Please try again in a few minutes." }, { status: 429 });
    }

    const body = await req.json();
    const {
      items,
      customerName,
      customerEmail,
      address,
      locality,
      city,
      state,
      pincode,
      phone,
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      discountAmount,
      shippingAmount,
    } = body;

    if (!Array.isArray(items) || !items.length || !customerName || !customerEmail || !address || !phone) {
      return NextResponse.json({ error: "Please provide all required delivery and contact details." }, { status: 400 });
    }

    // Check COD admin setting
    if (paymentMethod === "cod") {
      const codSetting = await db.select().from(settings).where(eq(settings.key, "cod_enabled")).limit(1);
      if (codSetting[0] && codSetting[0].value === "false") {
        return NextResponse.json({ error: "Cash on Delivery is currently unavailable. Please choose Prepaid." }, { status: 400 });
      }
    }

    // Validate cart items
    const ids = items.map((item) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== items.length || new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "Invalid cart items detected." }, { status: 400 });
    }

    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== items.length) {
      return NextResponse.json({ error: "One or more selected products are no longer available in the catalogue." }, { status: 400 });
    }

    const verifiedItems = items.map((item: any) => {
      const product = catalog.find((entry: any) => entry.id === item.productId)!;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }
      return { product, quantity };
    });

    const subtotal = verifiedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const discount = Math.max(0, Number(discountAmount) || 0);
    const shippingFee = Math.max(0, Number(shippingAmount) || 0);
    const total = Math.max(0, subtotal - discount + shippingFee);

    // If Razorpay online prepaid is configured
    const isPrepaid = paymentMethod === "prepaid" || paymentMethod === "razorpay";
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;

    let finalPaymentId = paymentMethod === "cod" ? "CASH_ON_DELIVERY" : (razorpayPaymentId || `PREPAID_TXN_${Date.now()}`);
    let finalOrderId = paymentMethod === "cod" ? null : (razorpayOrderId || `ORD_INT_${Date.now()}`);

    if (isPrepaid && razorpaySecret && razorpayKeyId && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const expected = createHmac("sha256", razorpaySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      if (razorpaySignature.length !== expected.length || !timingSafeEqual(Buffer.from(razorpaySignature), Buffer.from(expected))) {
        return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
      }
    }

    const orderId = uuidv4();

    await db.transaction(async (tx: any) => {
      // 1. Insert order record
      await tx.insert(orders).values({
        id: orderId,
        userId: user.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        address: address.trim(),
        locality: locality ? locality.trim() : null,
        city: city ? city.trim() : "Main City",
        state: state ? state.trim() : "State",
        pincode: pincode ? pincode.trim() : null,
        phone: phone.trim(),
        status: "confirmed",
        total: total.toFixed(2),
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        discount: discount.toFixed(2),
        paymentMethod: paymentMethod === "cod" ? "cod" : "prepaid",
        razorpayPaymentId: finalPaymentId,
        razorpayOrderId: finalOrderId,
      });

      // 2. Insert order items
      for (const item of verifiedItems) {
        await tx.insert(orderItems).values({
          id: uuidv4(),
          orderId,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantity,
          price: item.product.price,
        });

        // 3. Decrement product stock
        await tx
          .update(products)
          .set({ stock: Math.max(0, item.product.stock - item.quantity) })
          .where(eq(products.id, item.product.id));
      }
    });

    const created = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    // Trigger Automatic Transactional Emails for Customer & Admin
    void sendOrderNotifications({
      id: orderId,
      customerName,
      customerEmail,
      phone,
      total: total.toFixed(2),
      subtotal: subtotal.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      discount: discount.toFixed(2),
      paymentMethod: paymentMethod === "cod" ? "cod" : "prepaid",
      address,
      city,
      state,
      pincode,
      items: verifiedItems.map(({ product, quantity }) => ({
        productName: product.name,
        quantity,
        price: product.price,
      })),
    }).catch((err) => console.error("Order notification email error:", err));

    // Trigger Automatic WhatsApp Notifications for Customer & Admin
    const waDetails = await sendWhatsAppNotifications({
      orderId,
      customerName,
      customerPhone: phone,
      customerEmail,
      total: total.toFixed(2),
      paymentMethod: paymentMethod === "cod" ? "cod" : "prepaid",
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      items: verifiedItems.map(({ product, quantity }) => ({
        productName: product.name,
        quantity,
        price: product.price,
      })),
    }).catch((err) => {
      console.error("WhatsApp notification error:", err);
      return null;
    });

    return NextResponse.json(
      {
        ...created[0],
        whatsappLink: waDetails?.customerWhatsAppLink,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: error?.message || "Order placement failed. Please try again." }, { status: 500 });
  }
}
