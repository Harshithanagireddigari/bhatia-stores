import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

function isExternalImageUrl(value: unknown): value is string {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:";
  } catch { return false; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.trim().toLowerCase().slice(0, 100);

  let query = db.select().from(products).orderBy(products.createdAt);
  if (category || search) {
    const all = await query;
    return NextResponse.json(all.filter((p) => {
      const inCategory = !category || p.category === category;
      const searchable = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      return inCategory && (!search || searchable.includes(search));
    }));
  }

  const all = await query;
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, description, price, image, category, stock } = await req.json();
    if (!name || !description || !price || !image || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!isExternalImageUrl(image)) {
      return NextResponse.json({ error: "Upload the product image first. Product images must use the image storage URL." }, { status: 400 });
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
    });

    const created = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
