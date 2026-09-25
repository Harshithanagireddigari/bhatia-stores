import { NextResponse } from "next/server";
import { db } from "@/db";
import { boqRequests } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { notifyAdmin } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { name, email, phone, projectType, city, estimatedBudget, notes, fileUrl } =
      await req.json();

    if (!name || !email || !phone || !projectType || !city) {
      return NextResponse.json(
        { error: "Name, email, phone, project type, and city are required." },
        { status: 400 }
      );
    }

    const newRequest = {
      id: uuidv4(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      projectType: String(projectType).trim(),
      city: String(city).trim(),
      estimatedBudget: estimatedBudget ? String(estimatedBudget).trim() : null,
      notes: notes ? String(notes).trim() : null,
      fileUrl: fileUrl ? String(fileUrl).trim() : null,
      status: "pending",
    };

    await db.insert(boqRequests).values(newRequest);

    // Send admin notification & email alert
    await notifyAdmin({
      type: "boq_quote",
      title: `New BOQ Quote Request from ${newRequest.name}`,
      message: `${newRequest.name} (${newRequest.phone}, ${newRequest.city}) requested a BOQ quotation for a ${newRequest.projectType} project.`,
      link: "/admin/messages",
      details: {
        name: newRequest.name,
        email: newRequest.email,
        phone: newRequest.phone,
        city: newRequest.city,
        projectType: newRequest.projectType,
        estimatedBudget: newRequest.estimatedBudget,
      },
    });

    return NextResponse.json({
      message: "BOQ Quotation request submitted successfully. Our team will contact you within 24 hours.",
      id: newRequest.id,
    });
  } catch (error) {
    console.error("Error submitting BOQ request:", error);
    return NextResponse.json(
      { error: "Failed to submit BOQ quotation request." },
      { status: 500 }
    );
  }
}
