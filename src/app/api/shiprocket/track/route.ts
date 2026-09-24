import { NextResponse } from "next/server";
import { trackShiprocketByAwb } from "@/lib/shiprocket";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const awb = searchParams.get("awb");

  if (!awb) {
    return NextResponse.json({ error: "awb query parameter is required" }, { status: 400 });
  }

  try {
    const trackingData = await trackShiprocketByAwb(awb);
    if (!trackingData) {
      return NextResponse.json({ error: "Tracking information not found" }, { status: 404 });
    }

    return NextResponse.json(trackingData);
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
