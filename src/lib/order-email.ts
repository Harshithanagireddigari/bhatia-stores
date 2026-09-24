export type OrderEmail = {
  id: string;
  customerName: string;
  customerEmail: string;
  total: string;
  address: string;
  city: string;
  phone: string;
  paymentMethod: "cod" | "razorpay";
  razorpayPaymentId?: string | null;
  createdAt?: Date | string;
  items: { productName: string; quantity: number; price: string }[];
};

function money(value: string | number) {
  return `\u20B9${Number(value).toFixed(2)}`;
}

function escapeHtml(value: string) {
  if (!value) return "";
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  let from = process.env.EMAIL_FROM || "Bhatia Stores <onboarding@resend.dev>";
  
  if (from.includes("@gmail.com")) {
    from = "Bhatia Stores <onboarding@resend.dev>";
  }

  if (!apiKey) {
    console.warn("Order email skipped: RESEND_API_KEY is not configured.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error(`Resend email error to ${to} (${response.status}): ${errText}`);
    } else {
      console.log(`Notification email sent successfully to ${to}`);
    }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
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

export async function sendLoginOtpEmail({ to, name, otpCode }: { to: string; name?: string; otpCode: string }) {
  const safeName = escapeHtml(name || "Customer");
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const spacedOtp = otpCode.split("").join("  ");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c241d;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 20px; padding: 36px 32px; border: 1px solid #e7e2d7; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Logo & Date -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #f0ece3;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #4a3373;">THE BHATIAS</div>
                    <div style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #a08b68; text-transform: uppercase;">PREMIUM HARDWARE STORE</div>
                  </td>
                  <td align="right" valign="top" style="font-size: 11px; color: #78716c;">
                    ${dateStr}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-top: 28px; text-align: left;">
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #2c241d; margin: 0 0 8px 0;">Your Login Code</h1>
              <p style="font-size: 14px; color: #57534e; margin: 0; line-height: 1.5;">
                Hi <strong>${safeName}</strong>,<br>
                Here is your one-time code (OTP) to login to your The Bhatias account.
              </p>
            </td>
          </tr>

          <!-- Big OTP Display Box -->
          <tr>
            <td style="padding-top: 24px; padding-bottom: 24px;">
              <div style="background-color: #faf8f5; border: 2px dashed #b49663; border-radius: 16px; padding: 24px; text-align: center;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #4a3373;">
                  ${spacedOtp}
                </div>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="font-size: 13px; color: #78716c; line-height: 1.5; text-align: left;">
              This code is valid for 10 minutes.<br>
              If you didn't request this code, please ignore this email.
            </td>
          </tr>

          <!-- Sign off -->
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #f0ece3; margin-top: 24px; font-size: 12px; color: #78716c;">
              Best Regards,<br>
              <strong>The Bhatias Team</strong>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Hi ${name || "Customer"},\n\nYour one-time login code (OTP) for The Bhatias is: ${otpCode}\n\nThis code is valid for 10 minutes.\nIf you didn't request this code, please ignore this email.`;
  await sendEmail(to, `Your Login Code: ${otpCode}`, html, text);
}

export async function sendLowStockAlertEmail(product: {
  id: string;
  name: string;
  stock: number;
  image?: string;
  price?: string | number;
}) {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL || "harshithanagireddigari@gmail.com";
  if (!adminEmail) return;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const safeName = escapeHtml(product.name);
  const shortId = product.id.slice(0, 8).toUpperCase();
  const safeImage = product.image && product.image.startsWith("http") ? product.image : "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Low Stock Alert – The Bhatias Store</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c241d;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; padding: 36px 32px; border: 1px solid #e7e2d7; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Logo -->
          <tr>
            <td align="left" style="padding-bottom: 20px; border-bottom: 1px solid #f0ece3;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #4a3373;">THE BHATIAS</div>
                    <div style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #a08b68; text-transform: uppercase;">HARDWARE STORE</div>
                  </td>
                  <td align="right" valign="top" style="font-size: 11px; color: #78716c;">
                    ${dateStr}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Warning Header -->
          <tr>
            <td style="padding-top: 24px; text-align: left;">
              <div style="display: inline-block; background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 14px; font-weight: 700; padding: 8px 14px; border-radius: 8px; margin-bottom: 12px;">
                ⚠️ Low Stock Alert
              </div>
              <p style="font-size: 14px; color: #57534e; margin: 0 0 16px 0; line-height: 1.5;">
                Dear Owner,<br>
                The following product is running low on stock (less than 10 units remaining):
              </p>
            </td>
          </tr>

          <!-- Product Details Table -->
          <tr>
            <td>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #faf8f5; border: 1px solid #ede8de; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f5f0e6; font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: 700;">
                    <th style="padding: 10px 12px; text-align: left;">Product Image</th>
                    <th style="padding: 10px 12px; text-align: left;">Product Name</th>
                    <th style="padding: 10px 12px; text-align: center;">SKU</th>
                    <th style="padding: 10px 12px; text-align: center;">Current Stock</th>
                    <th style="padding: 10px 12px; text-align: center;">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="font-size: 13px;">
                    <td style="padding: 12px; border-top: 1px solid #ede8de;" align="left">
                      <img src="${safeImage}" width="48" height="48" style="border-radius: 8px; object-fit: cover; border: 1px solid #e7e2d7;" alt="${safeName}">
                    </td>
                    <td style="padding: 12px; border-top: 1px solid #ede8de; font-weight: 700; color: #2c241d;" align="left">
                      ${safeName}
                    </td>
                    <td style="padding: 12px; border-top: 1px solid #ede8de; color: #78716c;" align="center">
                      BT-${shortId}
                    </td>
                    <td style="padding: 12px; border-top: 1px solid #ede8de;" align="center">
                      <span style="background-color: #fee2e2; color: #dc2626; font-weight: 800; font-size: 14px; padding: 4px 10px; border-radius: 6px;">
                        ${product.stock}
                      </span>
                    </td>
                    <td style="padding: 12px; border-top: 1px solid #ede8de; font-weight: 700; color: #57534e;" align="center">
                      10
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top: 16px; font-size: 13px; color: #78716c; line-height: 1.5;">
              Please check and restock this item soon to avoid out-of-stock situations.
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <a href="https://bhatia-stores.vercel.app/admin/products" target="_blank" style="display: inline-block; background-color: #b49663; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 6px rgba(180,150,99,0.3);">
                View Product in Admin Panel &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 28px; text-align: left; border-top: 1px solid #f0ece3; margin-top: 24px; font-size: 12px; color: #78716c;">
              Best Regards,<br>
              <strong>The Bhatias Store System</strong>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Low Stock Alert – The Bhatias Store\n\nProduct: ${product.name} (SKU: BT-${shortId})\nCurrent Stock: ${product.stock} (Threshold: 10)\n\nPlease check and restock to avoid out-of-stock situations.\nView in Admin Panel: https://bhatia-stores.vercel.app/admin/products`;

  await sendEmail(adminEmail, `⚠️ Low Stock Alert – ${product.name} (Stock: ${product.stock})`, html, text);
}

function buildCustomerOrderHtml(order: OrderEmail) {
  const shortId = order.id.slice(0, 8);
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTotal = Number(order.total).toFixed(2);
  const isCod = order.paymentMethod === "cod";

  const itemRowsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0ece3;">
          <div style="font-size: 14px; font-weight: 700; color: #2c241d;">${escapeHtml(item.productName)}</div>
          <div style="font-size: 12px; color: #78716c; margin-top: 2px;">Qty: ${item.quantity}</div>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f0ece3; font-size: 14px; font-weight: 700; color: #2c241d;">
          \u20B9${(Number(item.price) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #${shortId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c241d;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 20px; padding: 36px 32px; border: 1px solid #e7e2d7; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Logo & Metadata -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #f0ece3;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #4a3373;">THE BHATIAS</div>
                    <div style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #a08b68; text-transform: uppercase;">PREMIUM HARDWARE STORE</div>
                  </td>
                  <td align="right" valign="top">
                    <div style="font-size: 11px; color: #78716c;">Order #TBH${shortId}</div>
                    <div style="font-size: 11px; color: #78716c; margin-top: 2px;">${dateStr}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-top: 28px; text-align: left;">
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #2c241d; margin: 0 0 8px 0;">Thank You for Your Order!</h1>
              <p style="font-size: 14px; color: #57534e; margin: 0; line-height: 1.5;">
                Hi <strong>${escapeHtml(order.customerName)}</strong>,<br>
                Your order has been placed successfully. We'll notify you once it is packed and shipped.
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding-top: 24px;">
              <div style="background-color: #faf8f5; border: 1px solid #ede8de; border-radius: 14px; padding: 20px 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #a08b68; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Order Summary</div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${itemRowsHtml}
                  <tr>
                    <td style="padding-top: 14px; font-size: 13px; color: #57534e;">Payment Method</td>
                    <td align="right" style="padding-top: 14px; font-size: 13px; font-weight: 700; color: #2c241d;">${isCod ? "Cash on Delivery" : "Online Prepaid"}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px; font-size: 16px; font-weight: 700; color: #2c241d;">Total Paid</td>
                    <td align="right" style="padding-top: 8px; font-size: 18px; font-weight: 800; color: #b49663;">\u20B9${formattedTotal}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- View Order Button -->
          <tr>
            <td align="center" style="padding-top: 28px;">
              <a href="https://bhatia-stores.vercel.app/orders" target="_blank" style="display: inline-block; background-color: #b49663; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 6px rgba(180,150,99,0.3);">
                View Order Details &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center; border-t: 1px solid #f0ece3; font-size: 12px; color: #78716c; line-height: 1.6;">
              Thanks for shopping with <strong>The Bhatias</strong>.<br>
              Need help? WhatsApp us at <strong>+91 91204 35950</strong>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function buildAdminOrderHtml(order: OrderEmail) {
  const shortId = order.id.slice(0, 8);
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedTotal = Number(order.total).toFixed(2);
  const isCod = order.paymentMethod === "cod";

  const itemRowsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0ece3; font-size: 13px; color: #2c241d;">
          ${escapeHtml(item.productName)} (x${item.quantity})
        </td>
        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f0ece3; font-size: 13px; font-weight: 700; color: #2c241d;">
          \u20B9${(Number(item.price) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order Received #${shortId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c241d;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 20px; padding: 36px 32px; border: 1px solid #e7e2d7; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Logo -->
          <tr>
            <td align="left" style="padding-bottom: 20px; border-bottom: 1px solid #f0ece3;">
              <div style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #4a3373;">THE BHATIAS</div>
              <div style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #a08b68; text-transform: uppercase;">STORE OWNER NOTIFICATION</div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-top: 24px; text-align: left;">
              <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 700; color: #2c241d; margin: 0 0 6px 0;">New Order Received!</h1>
              <p style="font-size: 14px; color: #57534e; margin: 0;">You have received a new order on Bhatia Stores.</p>
            </td>
          </tr>

          <!-- Order Details Card -->
          <tr>
            <td style="padding-top: 20px;">
              <div style="background-color: #faf8f5; border: 1px solid #ede8de; border-radius: 14px; padding: 20px 24px;">
                <div style="font-size: 12px; font-weight: 700; color: #a08b68; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">Order Details</div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.6;">
                  <tr>
                    <td width="40%" style="color: #78716c;">Order Number</td>
                    <td width="60%" style="font-weight: 700; color: #2c241d;">TBH${shortId}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Customer Name</td>
                    <td style="font-weight: 700; color: #2c241d;">${escapeHtml(order.customerName)}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Phone</td>
                    <td style="font-weight: 700; color: #2c241d;">${escapeHtml(order.phone)}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Email</td>
                    <td style="font-weight: 700; color: #2c241d;">${escapeHtml(order.customerEmail)}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;" valign="top">Delivery Address</td>
                    <td style="font-weight: 700; color: #2c241d;">${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ""}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Total Amount</td>
                    <td style="font-weight: 800; color: #b49663;">\u20B9${formattedTotal}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Payment Method</td>
                    <td style="font-weight: 700; color: #2c241d;">${isCod ? "Cash on Delivery" : "Online Prepaid"}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Order Date</td>
                    <td style="font-weight: 700; color: #2c241d;">${dateStr}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c;">Order Status</td>
                    <td><span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">Pending</span></td>
                  </tr>
                </table>

                <div style="border-t: 1px solid #ede8de; margin-top: 14px; padding-top: 14px;">
                  <div style="font-size: 12px; font-weight: 700; color: #78716c; margin-bottom: 8px;">Items</div>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    ${itemRowsHtml}
                  </table>
                </div>
              </div>
            </td>
          </tr>

          <!-- View Admin Button -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <a href="https://bhatia-stores.vercel.app/admin/orders" target="_blank" style="display: inline-block; background-color: #b49663; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 6px rgba(180,150,99,0.3);">
                View in Admin Panel &rarr;
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendOrderNotifications(order: OrderEmail) {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL;
  const shortId = order.id.slice(0, 8).toUpperCase();
  const payment = order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid";

  const plainItems = order.items
    .map((item) => `- ${item.productName} x ${item.quantity} - ${money(item.price)}`)
    .join("\n");

  const customerHtml = buildCustomerOrderHtml(order);
  const adminHtml = buildAdminOrderHtml(order);
  
  const customerText = `Thank you, ${order.customerName}!\n\nOrder #TBH${shortId} has been placed successfully.\nPayment: ${payment}\nTotal: ${money(order.total)}\nDelivery: ${order.address}${order.city ? `, ${order.city}` : ""}\n\nItems\n${plainItems}\n\nNeed help? WhatsApp +91 91204 35950.`;
  const adminText = `New order #TBH${shortId}\nCustomer: ${order.customerName} (${order.customerEmail})\nPhone: ${order.phone}\nDelivery: ${order.address}${order.city ? `, ${order.city}` : ""}\nPayment: ${payment}\nTotal: ${money(order.total)}\n\nItems\n${plainItems}`;

  // Send customer confirmation email
  await sendEmail(order.customerEmail, `Thank You for Your Order! #TBH${shortId}`, customerHtml, customerText);

  // Send admin store notification email
  if (adminEmail) {
    await sendEmail(adminEmail, `New Order Received! #TBH${shortId}`, adminHtml, adminText);
  }
}
