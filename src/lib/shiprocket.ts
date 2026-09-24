import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getShiprocketCredentials() {
  const envEmail = process.env.SHIPROCKET_EMAIL;
  const envPassword = process.env.SHIPROCKET_PASSWORD;

  // Retrieve store settings from DB for admin UI credentials fallback
  const res = await db.select().from(storeSettings).where(eq(storeSettings.key, "shiprocket")).limit(1);
  const settings = (res[0]?.value || {}) as { email?: string; password?: string; pickupLocation?: string; autoPush?: boolean };

  const email = envEmail || settings.email;
  const password = envPassword || settings.password;
  const pickupLocation = settings.pickupLocation || "Primary";
  const autoPush = settings.autoPush ?? true;

  if (email && password) {
    return { email, password, pickupLocation, autoPush };
  }

  return null;
}

export async function getShiprocketToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const creds = await getShiprocketCredentials();
  if (!creds) {
    return null;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: creds.email,
        password: creds.password,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Shiprocket Auth Failed:", err);
      return null;
    }

    const data = await res.json();
    if (data.token) {
      cachedToken = data.token;
      // Refresh token before expiry (default ~10 days)
      tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (error) {
    console.error("Shiprocket Login Error:", error);
  }
  return null;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export async function createShiprocketOrder(payload: Partial<ShiprocketOrderPayload>) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: "Shiprocket credentials missing or unauthenticated. Please configure Shiprocket Email & Password in Admin Settings." };

  try {
    const creds = await getShiprocketCredentials();
    const cleanPhone = (payload.billing_phone || "9999999999").replace(/\D/g, "").slice(-10);

    const finalPayload = {
      order_id: payload.order_id,
      order_date: payload.order_date || new Date().toISOString().replace("T", " ").substring(0, 19),
      pickup_location: payload.pickup_location || creds?.pickupLocation || "Primary",
      billing_customer_name: payload.billing_customer_name || "Customer",
      billing_address: payload.billing_address || "Customer Address",
      billing_city: payload.billing_city || "City",
      billing_pincode: payload.billing_pincode || "110001",
      billing_state: payload.billing_state || "Delhi",
      billing_country: payload.billing_country || "India",
      billing_email: payload.billing_email || "customer@example.com",
      billing_phone: cleanPhone || "9999999999",
      shipping_is_billing: true,
      order_items: payload.order_items || [],
      payment_method: payload.payment_method || "Prepaid",
      sub_total: payload.sub_total || 0,
      length: payload.length || 10,
      breadth: payload.breadth || 10,
      height: payload.height || 10,
      weight: payload.weight || 0.5,
    };

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(finalPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "Shiprocket order push failed", details: data };
    }

    return {
      success: true,
      shiprocketOrderId: String(data.order_id || ""),
      shipmentId: String(data.shipment_id || ""),
      awbCode: data.awb_code || null,
      courierName: data.courier_name || null,
      status: data.status,
      statusCode: data.status_code,
    };
  } catch (error) {
    console.error("Create Shiprocket order error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Shiprocket connection error" };
  }
}

export async function trackShiprocketByAwb(awbCode: string) {
  const token = await getShiprocketToken();
  if (!token) return null;

  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbCode)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Track Shiprocket error:", error);
    return null;
  }
}

export async function checkShiprocketPincodeServiceability(deliveryPincode: string, pickupPincode = "110001", weight = 0.5, cod = 0) {
  const token = await getShiprocketToken();
  if (!token) return null;

  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Shiprocket serviceability error:", error);
    return null;
  }
}
