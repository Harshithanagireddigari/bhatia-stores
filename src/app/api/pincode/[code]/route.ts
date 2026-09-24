import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const pincode = code?.trim();

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Please enter a valid 6-digit Indian pincode" },
      { status: 400 }
    );
  }

  // 1. Try PostalPincode API with 3s timeout
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].Status === "Success") {
        const postOffices = data[0].PostOffice || [];
        if (postOffices.length > 0) {
          const primaryOffice = postOffices[0];
          const deliveryAvailable = postOffices.some(
            (po: { DeliveryStatus?: string }) => po.DeliveryStatus === "Delivery"
          );

          return NextResponse.json({
            pincode,
            city: primaryOffice.District || primaryOffice.Division || primaryOffice.Name,
            district: primaryOffice.District,
            state: primaryOffice.State,
            postOffice: primaryOffice.Name,
            deliveryAvailable,
            officeCount: postOffices.length,
            postOffices: postOffices.map((po: { Name: string; DeliveryStatus: string }) => ({
              name: po.Name,
              delivery: po.DeliveryStatus === "Delivery",
            })),
          });
        }
      }
    }
  } catch (error) {
    console.warn("PostalPincode API failed/timed out, attempting Nominatim fallback...", error);
  }

  // 2. Fallback to OpenStreetMap Nominatim API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&addressdetails=1`,
      {
        headers: { "User-Agent": "BhatiaStoresEcommerceApp/1.0" },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};
        const district = addr.county || addr.state_district || addr.city || "";
        const state = addr.state || "";
        const city = addr.city || addr.town || addr.village || addr.county || district;

        return NextResponse.json({
          pincode,
          city: city || "India",
          district,
          state,
          postOffice: city || "Local Delivery Office",
          deliveryAvailable: true,
          officeCount: 1,
          postOffices: [{ name: city || pincode, delivery: true }],
        });
      }
    }
  } catch (error) {
    console.warn("Nominatim fallback failed, using 6-digit Indian postal code default...", error);
  }

  // 3. Fallback for valid 6-digit Indian postal code
  return NextResponse.json({
    pincode,
    city: "India",
    district: "",
    state: "",
    postOffice: `Pincode ${pincode}`,
    deliveryAvailable: true,
    officeCount: 1,
    postOffices: [{ name: `Pincode ${pincode}`, delivery: true }],
  });
}
