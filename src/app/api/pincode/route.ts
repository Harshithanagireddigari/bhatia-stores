import { NextResponse } from "next/server";
import { lookupPincode } from "@/lib/pincode";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("pincode");

    if (!code) {
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }

    const clean = code.replace(/\D/g, "");
    if (clean.length !== 6) {
      return NextResponse.json({
        valid: false,
        deliverable: false,
        message: "Please enter a valid 6-digit Indian postal code.",
      });
    }

    const data = lookupPincode(clean);

    if (!data || !data.deliverable) {
      return NextResponse.json({
        valid: false,
        deliverable: false,
        message: `Delivery is currently not available to pincode ${clean}. Please contact support for freight quote.`,
      });
    }

    return NextResponse.json({
      valid: true,
      deliverable: true,
      pincode: data.pincode,
      city: data.city,
      district: data.district,
      state: data.state,
      estimatedDays: data.estimatedDays,
      message: `Delivery available in ${data.estimatedDays} to ${data.city}, ${data.state}.`,
    });
  } catch (error) {
    console.error("Pincode lookup error:", error);
    return NextResponse.json({ error: "Failed to validate pincode" }, { status: 500 });
  }
}
