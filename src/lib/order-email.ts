type OrderEmail = {
  id: string;
  customerName: string;
  customerEmail: string;
  total: string;
  address: string;
  city: string;
  phone: string;
  paymentMethod: "cod" | "razorpay";
  items: { productName: string; quantity: number; price: string }[];
};

function money(value: string) {
  return `\u20B9${Number(value).toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("Order email skipped: RESEND_API_KEY or EMAIL_FROM is not configured.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!response.ok) {
    throw new Error(`Resend rejected the email (${response.status}): ${await response.text()}`);
  }
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: { to: string; name: string; resetUrl: string }) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl);
  await sendEmail(
    to,
    "Reset your Bhatia Stores password",
    `<h1>Reset your password</h1><p>Hello ${safeName},</p><p>Use the link below to set a new Bhatia Stores password. This link expires in one hour and can be used only once.</p><p><a href="${safeUrl}">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
    `Hello ${name},\n\nReset your Bhatia Stores password using this link (valid for one hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
  );
}

export async function sendOrderNotifications(order: OrderEmail) {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL;
  const shortId = order.id.slice(0, 8).toUpperCase();
  const payment = order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid";
  const items = order.items
    .map((item) => `<li>${escapeHtml(item.productName)} &times; ${item.quantity} &mdash; ${money(item.price)}</li>`)
    .join("");
  const plainItems = order.items
    .map((item) => `- ${item.productName} x ${item.quantity} - ${money(item.price)}`)
    .join("\n");
  const delivery = `${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ""}`;
  const customerHtml = `<h1>Thank you, ${escapeHtml(order.customerName)}!</h1><p>Your Bhatia Stores order <strong>#${shortId}</strong> has been received and is pending confirmation.</p><p><strong>Payment:</strong> ${payment}<br/><strong>Total:</strong> ${money(order.total)}<br/><strong>Delivery address:</strong> ${delivery}</p><h2>Items</h2><ul>${items}</ul><p>Need help? WhatsApp us at +91 91204 35950.</p>`;
  const adminHtml = `<h1>New order #${shortId}</h1><p><strong>Customer:</strong> ${escapeHtml(order.customerName)}<br/><strong>Email:</strong> ${escapeHtml(order.customerEmail)}<br/><strong>Phone:</strong> ${escapeHtml(order.phone)}<br/><strong>Delivery address:</strong> ${delivery}</p><p><strong>Payment:</strong> ${payment}<br/><strong>Total:</strong> ${money(order.total)}</p><h2>Items</h2><ul>${items}</ul>`;
  const customerText = `Thank you, ${order.customerName}!\n\nOrder #${shortId} has been received and is pending confirmation.\nPayment: ${payment}\nTotal: ${money(order.total)}\nDelivery: ${order.address}${order.city ? `, ${order.city}` : ""}\n\nItems\n${plainItems}\n\nNeed help? WhatsApp +91 91204 35950.`;
  const adminText = `New order #${shortId}\nCustomer: ${order.customerName} (${order.customerEmail})\nPhone: ${order.phone}\nDelivery: ${order.address}${order.city ? `, ${order.city}` : ""}\nPayment: ${payment}\nTotal: ${money(order.total)}\n\nItems\n${plainItems}`;

  const notifications = [sendEmail(order.customerEmail, `Order #${shortId} received`, customerHtml, customerText)];
  if (adminEmail) notifications.push(sendEmail(adminEmail, `New order #${shortId}`, adminHtml, adminText));
  await Promise.all(notifications);
}
