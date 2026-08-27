import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (await isRateLimited(req, "contact_form", 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many messages sent. Please try again in a few minutes." }, { status: 429 });
    }

    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const id = uuidv4();
    await db.insert(contactSubmissions).values({
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      subject: subject ? String(subject).trim() : "General Showroom Inquiry",
      message: message.trim(),
      status: "unread",
    });

    console.log(`[Contact] New inquiry received from ${name} (${email}): "${subject || 'General'}"`);

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting Bhatia Stores! Our showroom consultant will respond shortly.",
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "Failed to send message. Please reach out via WhatsApp." }, { status: 500 });
  }
}
