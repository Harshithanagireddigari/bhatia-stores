import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

interface OrderNotificationParams {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  total: string;
  subtotal?: string;
  shippingFee?: string;
  discount?: string;
  paymentMethod: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
  }>;
}

export async function sendOrderNotifications(params: OrderNotificationParams) {
  const {
    id,
    customerName,
    customerEmail,
    phone,
    total,
    subtotal,
    shippingFee = "0.00",
    discount = "0.00",
    paymentMethod,
    address = "Registered Address",
    city = "",
    state = "",
    pincode = "",
    items,
  } = params;

  // Retrieve store settings
  let storeEmail = "contact@bhatiastores.com";
  let storePhone = "+91 99849 79720";
  let storeAddress = "Bhatia Sanitary & Tiles Showroom, Main Ring Road, Sector 4, India";

  try {
    const sEmail = await db.select().from(settings).where(eq(settings.key, "store_email")).limit(1);
    if (sEmail[0]) storeEmail = sEmail[0].value;
    const sPhone = await db.select().from(settings).where(eq(settings.key, "store_phone")).limit(1);
    if (sPhone[0]) storePhone = sPhone[0].value;
    const sAddr = await db.select().from(settings).where(eq(settings.key, "store_address")).limit(1);
    if (sAddr[0]) storeAddress = sAddr[0].value;
  } catch {
    // ignore
  }

  const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Online)";

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-family: sans-serif; color: #333;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: center; font-family: sans-serif; color: #333;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right; font-family: sans-serif; color: #333;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right; font-family: sans-serif; font-weight: bold; color: #111;">₹${(Number(item.price) * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const fullAddress = [address, city, state, pincode].filter(Boolean).join(", ");

  const customerHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation - Bhatia Stores</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #FAF8F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <tr>
        <td style="background-color: #1C1917; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 600;">BHATIA STORES</h1>
          <p style="color: #C5A880; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Luxury Tiles & Sanitaryware</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #1C1917; margin-top: 0; font-size: 20px;">Thank you for your order, ${customerName}!</h2>
          <p style="color: #555555; line-height: 1.6; font-size: 14px;">Your order has been received and is being processed by our showroom fulfillment team. We will notify you once your materials are dispatched.</p>
          
          <div style="background-color: #F7F4EE; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table width="100%">
              <tr>
                <td style="font-size: 13px; color: #666;"><strong>Order Reference:</strong> #${id.slice(0, 8).toUpperCase()}</td>
                <td style="font-size: 13px; color: #666; text-align: right;"><strong>Payment:</strong> ${paymentLabel}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #666; padding-top: 6px;"><strong>Status:</strong> Confirmed</td>
                <td style="font-size: 13px; color: #666; text-align: right; padding-top: 6px;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #1C1917; font-size: 16px; margin-top: 25px; border-bottom: 2px solid #F7F4EE; padding-bottom: 8px;">Order Items</h3>
          <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
            <thead>
              <tr style="background-color: #FAF8F5; text-align: left;">
                <th style="padding: 8px; font-size: 12px; color: #666; text-transform: uppercase;">Product</th>
                <th style="padding: 8px; font-size: 12px; color: #666; text-align: center; text-transform: uppercase;">Qty</th>
                <th style="padding: 8px; font-size: 12px; color: #666; text-align: right; text-transform: uppercase;">Price</th>
                <th style="padding: 8px; font-size: 12px; color: #666; text-align: right; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              ${Number(discount) > 0 ? `
              <tr>
                <td colspan="3" style="padding: 8px 10px; text-align: right; font-size: 13px; color: #16a34a;">Discount Applied:</td>
                <td style="padding: 8px 10px; text-align: right; font-size: 13px; color: #16a34a; font-weight: bold;">-₹${Number(discount).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td colspan="3" style="padding: 8px 10px; text-align: right; font-size: 13px; color: #666;">Delivery & Freight:</td>
                <td style="padding: 8px 10px; text-align: right; font-size: 13px; color: #333; font-weight: bold;">${Number(shippingFee) === 0 ? '<span style="color:#16a34a">FREE</span>' : '₹' + Number(shippingFee).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px 10px; text-align: right; font-size: 16px; font-weight: bold; color: #1C1917;">Grand Total:</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 18px; font-weight: bold; color: #6B21A8;">₹${Number(total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 25px; padding: 16px; background-color: #FAF8F5; border-left: 4px solid #C5A880; border-radius: 4px;">
            <h4 style="margin: 0 0 6px 0; color: #1C1917; font-size: 14px;">Delivery Destination:</h4>
            <p style="margin: 0; color: #555555; font-size: 13px; line-height: 1.5;">${customerName}<br />${fullAddress}<br />Phone: ${phone}</p>
          </div>

          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px;">
            <p style="color: #666; font-size: 13px; margin: 0 0 8px 0;">Need immediate assistance with your dispatch or site installation?</p>
            <p style="margin: 0;"><strong style="color: #1C1917;">WhatsApp Concierge:</strong> <a href="https://wa.me/${storePhone.replace(/[^0-9]/g, '')}" style="color: #6B21A8; text-decoration: none;">${storePhone}</a> | <strong>Email:</strong> ${storeEmail}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background-color: #FAF8F5; padding: 16px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eaeaea;">
          &copy; ${new Date().getFullYear()} Bhatia Stores. All rights reserved.<br />
          ${storeAddress}
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const adminNotificationHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>New Order Alert - Bhatia Stores</title></head>
  <body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h2 style="color: #6B21A8; margin-top: 0;">🔔 New Order Received! (#${id.slice(0, 8).toUpperCase()})</h2>
      <p>A new order has been placed on Bhatia Stores.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Total Amount:</strong> <span style="font-size: 18px; color: #16a34a; font-weight: bold;">₹${Number(total).toFixed(2)}</span></p>
      <p><strong>Payment Method:</strong> ${paymentLabel}</p>
      <p><strong>Shipping Address:</strong> ${fullAddress}</p>
      <h3 style="margin-top: 20px;">Products:</h3>
      <ul>
        ${items.map(i => `<li><strong>${i.productName}</strong> x ${i.quantity} — ₹${(Number(i.price) * i.quantity).toFixed(2)}</li>`).join("")}
      </ul>
      <p style="font-size: 12px; color: #888; margin-top: 20px;">Received on ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </body>
  </html>
  `;

  // Check if Resend API is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminRecipient = process.env.ORDER_NOTIFICATION_EMAIL || storeEmail;
  const fromAddress = process.env.EMAIL_FROM || "Bhatia Stores <orders@bhatiastores.com>";

  if (resendApiKey) {
    try {
      // Dispatch Customer Email
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: customerEmail,
          subject: `Order Confirmation #${id.slice(0, 8).toUpperCase()} - Bhatia Stores`,
          html: customerHtml,
        }),
      });

      // Dispatch Admin Notification Email
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: adminRecipient,
          subject: `[New Order Alert] ₹${Number(total).toFixed(2)} from ${customerName} (#${id.slice(0, 8).toUpperCase()})`,
          html: adminNotificationHtml,
        }),
      });
      console.log(`[Email] Transactional order emails sent via Resend for order ${id}`);
    } catch (err) {
      console.error("[Email] Resend dispatch error:", err);
    }
  } else {
    // Development / Local mode log
    console.log(`[Email System] Automatic transactional emails prepared:`);
    console.log(`  -> To Customer (${customerEmail}): Order #${id.slice(0, 8).toUpperCase()} - Total: ₹${total} (${paymentLabel})`);
    console.log(`  -> To Admin (${adminRecipient}): New Order from ${customerName} (${phone}) - Total: ₹${total}`);
  }
}

export async function sendOrderStatusUpdateEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  total: string;
}) {
  const { orderId, customerName, customerEmail, newStatus, total } = params;
  console.log(`[Email System] Order status changed to "${newStatus}" for customer ${customerEmail} (Order #${orderId.slice(0, 8).toUpperCase()})`);
}
