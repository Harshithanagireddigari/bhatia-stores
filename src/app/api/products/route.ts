import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

function isValidProductImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  const str = value.trim();
  if (str.startsWith("/") || str.startsWith("data:image/")) return true;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.trim().toLowerCase().slice(0, 100);
  const finish = searchParams.get("finish");
  const mountType = searchParams.get("mountType");
  const brand = searchParams.get("brand");
  const waterSaving = searchParams.get("waterSaving");
  const antiRust = searchParams.get("antiRust");
  const sensorType = searchParams.get("sensorType");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const query = db
    .select()
    .from(products)
    .orderBy(products.sortOrder, products.createdAt);
  const all = await query;

  const filtered = all.filter((p) => {
    const inCategory = !category || category === "All" || p.category === category;
    const searchable = `${p.name} ${p.description} ${p.category} ${p.brand ?? ""} ${p.finish ?? ""}`.toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesFinish = !finish || finish === "All" || p.finish === finish;
    const matchesMount = !mountType || mountType === "All" || p.mountType === mountType;
    const matchesBrand = !brand || brand === "All" || p.brand === brand;
    const matchesWater = !waterSaving || (waterSaving === "1" ? p.waterSaving === 1 : true);
    const matchesRust = !antiRust || (antiRust === "1" ? p.antiRust === 1 : true);
    const matchesSensor = !sensorType || (sensorType === "1" ? p.sensorType === 1 : true);
    
    const priceNum = parseFloat(p.price);
    const matchesMinPrice = !minPrice || priceNum >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || priceNum <= parseFloat(maxPrice);

    return (
      inCategory &&
      matchesSearch &&
      matchesFinish &&
      matchesMount &&
      matchesBrand &&
      matchesWater &&
      matchesRust &&
      matchesSensor &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, description, price, image, category, stock, suiteRoom, suiteStep, sortOrder, isFeatured } = await req.json();
    if (!name || !description || price === undefined || !image || !category) {
      return NextResponse.json({ error: "All required fields (name, description, price, image, category) must be provided." }, { status: 400 });
    }
    if (!isValidProductImageUrl(image)) {
      return NextResponse.json({ error: "Please upload a valid product image." }, { status: 400 });
    }

    const id = uuidv4();
    await db.insert(products).values({
      id,
      name,
      description,
      price: price.toString(),
      image,
      category,
      stock: stock || 0,
      suiteRoom: suiteRoom || null,
      suiteStep: suiteStep || null,
      sortOrder: Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0,
      isFeatured: isFeatured ? 1 : 0,
    });

    const created = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
