import { db } from "@/db";
import { users, products } from "@/db/schema";
import { hashPassword, safeEqual } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { apiFailure, jsonError, jsonResponse, notFound } from "@/lib/security/http";

export const dynamic = "force-dynamic";

/**
 * Seeding route: strictly disabled in production.
 *
 * In development, requires POST and admin authentication or a configured
 * `x-seed-secret` header. Never returns plaintext credentials in the response.
 */
export async function GET() {
  return notFound();
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return notFound();
  }

  // Check authorization: either admin session or SEED_SECRET header
  const seedSecret = process.env.SEED_SECRET;
  const providedSecret = req.headers.get("x-seed-secret");
  const hasSecretAuth =
    Boolean(seedSecret && providedSecret && safeEqual(providedSecret, seedSecret));

  if (!hasSecretAuth) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return jsonError("Forbidden", 403);
    }
  }

  try {
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@bhatia.com"))
      .limit(1);

    if (existingAdmin[0]) {
      return jsonResponse({ message: "Already seeded" });
    }

    const adminId = uuidv4();
    const userId = uuidv4();

    // Passwords hashed with bcrypt cost factor 12
    const defaultAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || "AdminBhatia@2026!";
    const defaultUserPassword = process.env.INITIAL_USER_PASSWORD || "UserBhatia@2026!";

    await db.insert(users).values({
      id: adminId,
      name: "Admin Bhatia",
      email: "admin@bhatia.com",
      password: await hashPassword(defaultAdminPassword),
      role: "admin",
    });

    await db.insert(users).values({
      id: userId,
      name: "Rahul Sharma",
      email: "user@bhatia.com",
      password: await hashPassword(defaultUserPassword),
      role: "customer",
    });

    const sampleProducts = [
      { name: "Wireless Headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear audio with deep bass.", price: "2499.00", image: "/products/catalog/bhatia-catalogue-01.jpg", category: "Electronics", stock: 50 },
      { name: "Smart Watch Pro", description: "Feature-packed smartwatch with heart rate monitoring, GPS tracking, and 7-day battery. Water resistant up to 50m.", price: "4999.00", image: "/products/catalog/bhatia-catalogue-02.jpg", category: "Electronics", stock: 30 },
      { name: "Cotton T-Shirt", description: "100% organic cotton t-shirt. Soft, breathable, and perfect for everyday wear. Available in multiple colors.", price: "799.00", image: "/products/catalog/bhatia-catalogue-03.jpg", category: "Clothing", stock: 100 },
      { name: "Denim Jacket", description: "Classic denim jacket with a modern fit. Premium quality denim that gets better with age.", price: "2999.00", image: "/products/catalog/bhatia-catalogue-04.jpg", category: "Clothing", stock: 25 },
      { name: "Non-Stick Pan Set", description: "3-piece non-stick cookware set. Suitable for all stove types including induction. Easy to clean.", price: "1899.00", image: "/products/catalog/bhatia-catalogue-05.jpg", category: "Home & Kitchen", stock: 40 },
      { name: "LED Desk Lamp", description: "Adjustable LED desk lamp with 5 brightness levels and 3 color temperatures. USB charging port included.", price: "1299.00", image: "/products/catalog/bhatia-catalogue-06.jpg", category: "Home & Kitchen", stock: 60 },
      { name: "Fiction Bestseller", description: "Award-winning fiction novel. A gripping tale of mystery, adventure, and self-discovery.", price: "499.00", image: "/products/catalog/bhatia-catalogue-07.jpg", category: "Books", stock: 200 },
      { name: "Yoga Mat", description: "Extra thick 6mm yoga mat with alignment lines. Non-slip surface, perfect for yoga and pilates.", price: "999.00", image: "/products/catalog/bhatia-catalogue-08.jpg", category: "Sports", stock: 75 },
      { name: "Face Serum", description: "Vitamin C face serum with hyaluronic acid. Brightens skin, reduces dark spots, and hydrates deeply.", price: "699.00", image: "/products/catalog/bhatia-catalogue-09.jpg", category: "Beauty", stock: 80 },
      { name: "Running Shoes", description: "Lightweight running shoes with responsive cushioning. Breathable mesh upper for maximum comfort.", price: "3499.00", image: "/products/catalog/bhatia-catalogue-10.jpg", category: "Sports", stock: 45 },
      { name: "Bluetooth Speaker", description: "Portable bluetooth speaker with 360° sound. 12-hour battery life, waterproof design.", price: "1999.00", image: "/products/catalog/bhatia-catalogue-11.jpg", category: "Electronics", stock: 55 },
      { name: "Sunglasses", description: "UV400 protection polarized sunglasses. Lightweight titanium frame with scratch-resistant lenses.", price: "1499.00", image: "/products/catalog/bhatia-catalogue-12.jpg", category: "Clothing", stock: 65 },
    ];

    for (const p of sampleProducts) {
      await db.insert(products).values({
        id: uuidv4(),
        ...p,
      });
    }

    return jsonResponse({
      ok: true,
      message: "Database seeded successfully. Credentials configured via environment variables.",
    });
  } catch (error) {
    return apiFailure("seed", error);
  }
}
