// WhatsApp Notification System for Customer & Admin
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface WhatsAppNotificationData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: string;
  paymentMethod: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
  }>;
}

export function generateCustomerWhatsAppMessage(data: WhatsAppNotificationData, storePhone: string): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const paymentText = data.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Online Verified)";
  const itemsText = data.items.map((i) => `• ${i.productName} (x${i.quantity}) - ₹${(Number(i.price) * i.quantity).toFixed(2)}`).join("\n");
  const fullAddress = [data.address, data.city, data.state, data.pincode].filter(Boolean).join(", ");

  return `*✨ ORDER CONFIRMATION - BHATIA STORES ✨*

Dear *${data.customerName}*,

Thank you for choosing *Bhatia Stores* for your tile & sanitaryware requirements! We have received your order and our showroom fulfillment team is preparing your dispatch.

*📦 Order Details:*
• *Order ID:* #${shortId}
• *Payment Mode:* ${paymentText}
• *Total Amount:* ₹${Number(data.total).toFixed(2)}

*🛍️ Ordered Items:*
${itemsText}

*📍 Delivery Destination:*
${fullAddress}

*📞 Need assistance or layout guidance?*
Call/WhatsApp our concierge at +${storePhone}
Visit: https://bhatiastores.com

_Thank you for letting us be part of crafting your beautiful spaces!_`;
}

export function generateAdminWhatsAppMessage(data: WhatsAppNotificationData): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const paymentText = data.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Prepaid (Online)";
  const itemsText = data.items.map((i) => `• ${i.productName} x ${i.quantity} = ₹${(Number(i.price) * i.quantity).toFixed(2)}`).join("\n");
  const fullAddress = [data.address, data.city, data.state, data.pincode].filter(Boolean).join(", ");

  return `*🔔 NEW ORDER ALERT - BHATIA STORES 🔔*

*Order ID:* #${shortId}
*Total Value:* ₹${Number(data.total).toFixed(2)}
*Payment:* ${paymentText}

*👤 Customer Info:*
• Name: ${data.customerName}
• Phone: ${data.customerPhone}
• Email: ${data.customerEmail}

*📦 Items to Dispatch:*
${itemsText}

*📍 Delivery Address:*
${fullAddress}

*Time:* ${new Date().toLocaleString("en-IN")}`;
}

export async function sendWhatsAppNotifications(data: WhatsAppNotificationData) {
  let storePhone = "919984979720";
  try {
    const s = await db.select().from(settings).where(eq(settings.key, "store_whatsapp")).limit(1);
    if (s[0]) storePhone = s[0].value.replace(/\D/g, "");
  } catch {
    // ignore
  }

  const customerMsg = generateCustomerWhatsAppMessage(data, storePhone);
  const adminMsg = generateAdminWhatsAppMessage(data);

  // Check if official WhatsApp Cloud API is configured
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER || storePhone;

  if (phoneNumberId && accessToken) {
    try {
      // 1. Send to Customer
      const cleanCustomerPhone = data.customerPhone.replace(/\D/g, "");
      const formattedCustomer = cleanCustomerPhone.startsWith("91") ? cleanCustomerPhone : `91${cleanCustomerPhone}`;

      await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedCustomer,
          type: "text",
          text: { preview_url: false, body: customerMsg },
        }),
      });

      // 2. Send to Admin
      await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: adminWhatsAppNumber,
          type: "text",
          text: { preview_url: false, body: adminMsg },
        }),
      });

      console.log(`[WhatsApp API] Order notifications dispatched successfully for order ${data.orderId}`);
    } catch (err) {
      console.error("[WhatsApp API] Dispatch error:", err);
    }
  } else {
    // Log formatted messages for development & preview
    console.log(`[WhatsApp System] Notifications generated:`);
    console.log(`--- CUSTOMER WHATSAPP (${data.customerPhone}) ---`);
    console.log(customerMsg);
    console.log(`--- ADMIN WHATSAPP (${adminWhatsAppNumber}) ---`);
    console.log(adminMsg);
  }

  return {
    customerMessage: customerMsg,
    adminMessage: adminMsg,
    customerWhatsAppLink: `https://wa.me/${storePhone}?text=${encodeURIComponent(
      `Hello Bhatia Stores, I have placed Order #${data.orderId.slice(0, 8).toUpperCase()}. Could you please update me on delivery dispatch?`
    )}`,
  };
}
