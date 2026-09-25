import { db } from "@/db";
import { notifications } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

interface NotifyAdminParams {
  type: "boq_quote" | "return_request" | "order_placed";
  title: string;
  message: string;
  link?: string;
  details?: Record<string, any>;
}

export async function notifyAdmin({ type, title, message, link, details }: NotifyAdminParams) {
  try {
    // 1. Insert into database notifications
    const id = uuidv4();
    await db.insert(notifications).values({
      id,
      type,
      title,
      message,
      link: link || null,
      isRead: 0,
    });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@bhatias.com";

    // 2. Send Email Notification (via Resend API if configured, or clean system alert log)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "The Bhatias Alerts <notifications@bhatia-stores.com>",
            to: [adminEmail],
            subject: `[Bhatia Stores Alert] ${title}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #111;">
                <h2 style="color: #b49663;">${title}</h2>
                <p style="font-size: 14px; line-height: 1.6;">${message}</p>
                ${
                  link
                    ? `<p><a href="${link}" style="background: #b49663; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View in Admin Panel</a></p>`
                    : ""
                }
                ${
                  details
                    ? `<pre style="background: #f4f4f4; padding: 12px; border-radius: 6px; font-size: 12px;">${JSON.stringify(
                        details,
                        null,
                        2
                      )}</pre>`
                    : ""
                }
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.warn("Resend email delivery notice:", emailErr);
      }
    } else {
      console.log(`[ADMIN NOTIFICATION EMAIL] To: ${adminEmail} | Subject: ${title} | Message: ${message}`);
    }

    // 3. System notification alert log
    console.log(`🔔 [ADMIN ALERT] ${type.toUpperCase()}: ${title} - ${message}`);
  } catch (err) {
    console.error("Error creating admin notification:", err);
  }
}
