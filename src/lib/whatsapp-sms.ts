/**
 * Professional WhatsApp & SMS Messaging Service for Customer Orders & Status Updates
 */

export interface OrderMessageData {
  orderId: string;
  customerName: string;
  status: string;
  totalAmount: string;
  paymentMethod?: string;
  address?: string;
  city?: string;
  phone: string;
}

export interface BOQMessageData {
  name: string;
  phone: string;
  projectType: string;
  city: string;
  estimatedBudget?: string | null;
  notes?: string | null;
}

/**
 * Generate a direct WhatsApp Web/App deep link pre-filled with customer details
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Professional Formatted WhatsApp Message for Customer Orders
 */
export function formatOrderWhatsAppMessage({
  orderId,
  customerName,
  status,
  totalAmount,
  paymentMethod = "Cash on Delivery",
  address,
  city,
}: OrderMessageData): string {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const upperStatus = status.toUpperCase();

  return `✨ *THE BHATIAS — PREMIUM HARDWARE STORE* ✨
─────────────────────────────
📦 *ORDER UPDATE: #${shortId}*

Dear *${customerName}*,

Thank you for shopping with *The Bhatias Premium Hardware Store*! Your order status has been updated.

📋 *Order Details:*
• *Order ID:* #${shortId}
• *Current Status:* ${upperStatus} ✓
• *Total Amount:* ₹${parseFloat(totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
• *Payment Method:* ${paymentMethod}

${address ? `📍 *Delivery Address:*\n${address}${city ? `, ${city}` : ""}\n` : ""}
🚚 *Live Order Tracking:*
https://bhatia-stores.vercel.app/orders/${orderId}

If you have any questions or require installation support, reply directly to this chat or call us at +91 98765 43210.

*The Bhatias Premium Hardware Store*`;
}

/**
 * Generate Professional Formatted WhatsApp Message for BOQ Project Quotes
 */
export function formatBOQQuoteWhatsAppMessage({
  name,
  projectType,
  city,
  estimatedBudget,
  notes,
}: BOQMessageData): string {
  return `🏛️ *THE BHATIAS — PROJECT & BOQ QUOTATION* 🏛️
─────────────────────────────
Dear *${name}*,

Thank you for requesting a project quotation with *The Bhatias Premium Hardware Store*!

📋 *Project Summary:*
• *Customer Name:* ${name}
• *Project Type:* ${projectType}
• *City / Location:* ${city}
${estimatedBudget ? `• *Estimated Budget:* ${estimatedBudget}\n` : ""}${notes ? `\n📝 *Your Notes:* "${notes}"\n` : ""}
Our technical experts have reviewed your project requirements and prepared custom trade pricing.

💬 *Next Steps:*
Please let us know your target delivery timeline or specific brand preferences (Jaguar, Kohler, Cera, Grohe), or let us know if you'd like a call from our project consultant.

*The Bhatias B2B & Project Team*`;
}

/**
 * Send Automated Order Confirmation via WhatsApp API / Gateway
 */
export async function sendCustomerOrderWhatsAppSMS({
  phone,
  customerName,
  orderId,
  totalAmount,
  itemsCount,
}: {
  phone: string;
  customerName: string;
  orderId: string;
  totalAmount: string;
  itemsCount: number;
}) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const messageText = formatOrderWhatsAppMessage({
    orderId,
    customerName,
    status: "Confirmed",
    totalAmount,
    phone,
  });

  // 1. WhatsApp Business API / Twilio WhatsApp Integration
  const whatsappApiUrl = process.env.WHATSAPP_API_URL;
  const whatsappToken = process.env.WHATSAPP_API_TOKEN;

  if (whatsappApiUrl && whatsappToken) {
    try {
      await fetch(whatsappApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${whatsappToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: messageText },
        }),
      });
      console.log(`[WHATSAPP SENT] To ${formattedPhone} for Order #${orderId}`);
    } catch (err) {
      console.warn("WhatsApp API delivery error:", err);
    }
  }

  // 2. SMS Gateway Integration (Fast2SMS / Twilio)
  const smsApiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;

  if (smsApiKey) {
    try {
      await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: smsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `Order #${orderId.slice(0, 8).toUpperCase()} confirmed at The Bhatias! Total: ₹${totalAmount}. Track: https://bhatia-stores.vercel.app/orders/${orderId}`,
          language: "english",
          flash: 0,
          numbers: cleanPhone.slice(-10),
        }),
      });
    } catch (err) {
      console.warn("SMS API delivery error:", err);
    }
  }
}
