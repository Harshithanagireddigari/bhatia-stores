import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createShiprocketOrder } from "@/lib/shiprocket";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderList = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = orderList[0];
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const itemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // Extract pincode from address string if present (6-digit number)
    const pincodeMatch = order.address.match(/\b\d{6}\b/);
    const billingPincode = pincodeMatch ? pincodeMatch[0] : "110001";

    const shiprocketResult = await createShiprocketOrder({
      order_id: `BHATIA-${order.id.slice(0, 8).toUpperCase()}`,
      order_date: new Date(order.createdAt).toISOString().replace("T", " ").substring(0, 19),
      billing_customer_name: order.customerName,
      billing_address: order.address,
      billing_city: order.city || "City",
      billing_pincode: billingPincode,
      billing_email: order.customerEmail,
      billing_phone: order.phone,
      payment_method: order.razorpayPaymentId === "cash_on_delivery" ? "COD" : "Prepaid",
      sub_total: Number(order.total),
      order_items: itemsList.map((item) => ({
        name: item.productName,
        sku: item.productId.slice(0, 10),
        units: item.quantity,
        selling_price: Number(item.price),
      })),
    });

    if (!shiprocketResult.success) {
      return NextResponse.json(
        { error: shiprocketResult.error || "Shiprocket Push Failed", details: shiprocketResult.details },
        { status: 400 }
      );
    }

    // Save Shiprocket IDs into Database and set order status to shipped
    await db
      .update(orders)
      .set({
        shiprocketOrderId: shiprocketResult.shiprocketOrderId,
        shiprocketShipmentId: shiprocketResult.shipmentId,
        shiprocketAwbCode: shiprocketResult.awbCode || null,
        courierName: shiprocketResult.courierName || "Shiprocket Courier",
        status: "shipped",
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      message: "Order successfully pushed to Shiprocket!",
      shiprocketOrderId: shiprocketResult.shiprocketOrderId,
      shipmentId: shiprocketResult.shipmentId,
      awbCode: shiprocketResult.awbCode,
    });
  } catch (error) {
    console.error("Shiprocket create order API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
