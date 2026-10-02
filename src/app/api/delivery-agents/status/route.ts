import { NextResponse } from "next/server";
import { db } from "@/db";
import { deliveryAssignments, orders, notifications } from "@/db/schema";
import { sendCustomerOrderWhatsAppSMS, formatOrderWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp-sms";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { assignmentId, orderId, newStatus, statusNotes, proofImageUrl, otp } = await req.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: "orderId and newStatus are required" }, { status: 400 });
    }

    const orderList = await db.select().from(orders).where(eq(orders.id, orderId));
    if (orderList.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderList[0];

    // Meesho-style Customer Delivery OTP Verification
    if (newStatus === "delivered") {
      let expectedOtp = "4892";
      if (assignmentId) {
        const asgnList = await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.id, assignmentId));
        if (asgnList.length > 0 && asgnList[0].deliveryOtp) {
          expectedOtp = asgnList[0].deliveryOtp;
        }
      } else {
        const asgnList = await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.orderId, orderId));
        if (asgnList.length > 0 && asgnList[0].deliveryOtp) {
          expectedOtp = asgnList[0].deliveryOtp;
        }
      }

      const submittedOtp = (otp || "").toString().trim();
      if (!submittedOtp || submittedOtp !== expectedOtp.trim()) {
        return NextResponse.json(
          {
            error: `Invalid Delivery OTP "${submittedOtp || "blank"}". Please ask customer ${order.customerName} for the 4-digit Delivery OTP sent to their mobile/email.`,
          },
          { status: 400 }
        );
      }
    }

    // Map delivery status to order status enum if appropriate
    let dbOrderStatus: any = order.status;
    if (newStatus === "shipped") dbOrderStatus = "shipped";
    if (newStatus === "delivered") dbOrderStatus = "delivered";

    // Update order status in orders table
    await db
      .update(orders)
      .set({
        status: dbOrderStatus,
        deliveredAt: newStatus === "delivered" ? new Date() : order.deliveredAt,
      })
      .where(eq(orders.id, orderId));

    // Update assignment record if assignmentId provided
    if (assignmentId) {
      await db
        .update(deliveryAssignments)
        .set({
          currentStatus: newStatus,
          statusNotes: statusNotes || null,
          proofImageUrl: proofImageUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(deliveryAssignments.id, assignmentId));
    }

    // Create Admin/Store Live Notification
    await db.insert(notifications).values({
      id: `notif_${uuidv4()}`,
      type: "order_placed",
      title: `Delivery Agent Updated Order #${orderId.slice(0, 8).toUpperCase()}`,
      message: `Status updated to "${newStatus.replace("_", " ").toUpperCase()}" by delivery agent.`,
      link: `/orders/${orderId}`,
      isRead: 0,
    });

    // Automatically send WhatsApp & Email message to customer
    await sendCustomerOrderWhatsAppSMS({
      phone: order.phone,
      customerName: order.customerName,
      orderId: order.id,
      totalAmount: order.total,
      itemsCount: 1,
    });

    const waText = formatOrderWhatsAppMessage({
      orderId: order.id,
      customerName: order.customerName,
      status: newStatus.replace("_", " ").toUpperCase(),
      totalAmount: order.total,
      phone: order.phone,
      address: order.address,
      city: order.city,
    });

    const waLink = getWhatsAppUrl(order.phone, waText);

    return NextResponse.json({
      message: "Delivery status updated & notification sent to customer!",
      whatsappLink: waLink,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return NextResponse.json({ error: "Status update failed" }, { status: 500 });
  }
}
