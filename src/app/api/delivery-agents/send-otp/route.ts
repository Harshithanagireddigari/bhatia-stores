import { NextResponse } from "next/server";
import { db } from "@/db";
import { deliveryAssignments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getWhatsAppUrl } from "@/lib/whatsapp-sms";

export async function POST(req: Request) {
  try {
    const { orderId, assignmentId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderRes = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!orderRes[0]) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderRes[0];

    // Find assignment
    let asgn = null;
    if (assignmentId) {
      const res = await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.id, assignmentId)).limit(1);
      asgn = res[0] || null;
    }
    if (!asgn) {
      const res = await db.select().from(deliveryAssignments).where(eq(deliveryAssignments.orderId, orderId)).limit(1);
      asgn = res[0] || null;
    }

    let otp = asgn?.deliveryOtp;
    if (!otp || otp.trim().length !== 4) {
      otp = Math.floor(1000 + Math.random() * 9000).toString();
      if (asgn) {
        await db.update(deliveryAssignments).set({ deliveryOtp: otp, updatedAt: new Date() }).where(eq(deliveryAssignments.id, asgn.id));
      }
    }

    const shortId = orderId.slice(0, 8).toUpperCase();
    const customerPhone = order.phone || "";
    const customerName = order.customerName || "Customer";

    const waMessage = `✨ *THE BHATIAS — DELIVERY VERIFICATION OTP* ✨\n─────────────────────────────\nHello *${customerName}*,\n\nYour delivery executive is arriving with your order *#${shortId}*.\n\n🔑 *YOUR 4-DIGIT DELIVERY OTP:* *${otp}*\n\nPlease share this verification OTP with the delivery executive upon arrival to receive your parcel.\n\nOrder Total: ₹${parseFloat(order.total).toLocaleString("en-IN")}\nTracking: https://bhatia-stores.vercel.app/orders/${orderId}\n\n*The Bhatias Premium Hardware Store*`;

    const whatsappLink = customerPhone ? getWhatsAppUrl(customerPhone, waMessage) : null;

    // Send email to customer if RESEND_API_KEY is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && order.customerEmail) {
      try {
        const from = process.env.EMAIL_FROM || "Bhatia Stores <onboarding@resend.dev>";
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: from.includes("@gmail.com") ? "Bhatia Stores <onboarding@resend.dev>" : from,
            to: [order.customerEmail],
            subject: `Your Delivery Verification OTP is ${otp} — Order #${shortId}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
                <h2 style="color: #4f46e5; margin-bottom: 8px;">The Bhatias Premium Hardware Store</h2>
                <h3 style="color: #111827; margin-top: 0;">Delivery Verification OTP</h3>
                <p>Hello <strong>${customerName}</strong>,</p>
                <p>Your order <strong>#${shortId}</strong> is out for delivery. Please provide the following 4-digit OTP to the delivery executive when they arrive:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981;">${otp}</span>
                </div>
                <p style="color: #6b7280; font-size: 13px;">Do not share this OTP until you have inspected and received your package.</p>
              </div>
            `,
            text: `Hello ${customerName},\n\nYour order #${shortId} is out for delivery.\nYour 4-digit Delivery Verification OTP is: ${otp}\n\nPlease share this with the delivery executive to receive your parcel.`,
          }),
        });
      } catch (err) {
        console.warn("Delivery OTP email error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      otp,
      whatsappLink,
      customerPhone,
      customerEmail: order.customerEmail,
      message: `OTP ${otp} sent to customer!`,
    });
  } catch (error) {
    console.error("Error sending delivery OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
