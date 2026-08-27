import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { desc, asc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const sort = searchParams.get("sort") || "featured";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const inStockOnly = searchParams.get("inStock") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    let all: any[] = await db.select().from(products).orderBy(desc(products.createdAt));

    let filtered = all.filter((p: any) => {
      // Category filter
      if (category && category !== "All" && category !== "all") {
        if (p.category.toLowerCase() !== category.toLowerCase()) return false;
      }

      // Price filter
      const priceNum = parseFloat(p.price);
      if (priceNum < minPrice || priceNum > maxPrice) return false;

      // Stock filter
      if (inStockOnly && p.stock <= 0) return false;

      // Featured filter
      if (featuredOnly && p.featured !== 1) return false;

      // Search filter
      if (search) {
        const query = `${p.name} ${p.description} ${p.category} ${p.finish || ""} ${p.dimensions || ""} ${p.material || ""}`.toLowerCase();
        if (!query.includes(search)) return false;
      }

      return true;
    });

    // Sorting
    if (sort === "price-asc") {
      filtered.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === "price-desc") {
      filtered.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sort === "name-asc") {
      filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      filtered.sort((a: any, b: any) => b.name.localeCompare(a.name));
    } else if (sort === "rating-desc") {
      filtered.sort((a: any, b: any) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
    } else if (sort === "newest") {
      filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // "featured" default
      filtered.sort((a: any, b: any) => (b.featured || 0) - (a.featured || 0));
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const {
      name,
      description,
      price,
      image,
      images,
      category,
      stock,
      dimensions,
      finish,
      material,
      rating,
      featured,
      isPopular,
    } = await req.json();

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Name, description, price, and category are required." }, { status: 400 });
    }

    const primaryImage = image || (Array.isArray(images) && images[0]) || "/products/new-stock/pgvt-01.jpg";
    const imageList = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

    const id = uuidv4();
    await db.insert(products).values({
      id,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price).toFixed(2),
      image: primaryImage,
      images: imageList,
      category: category.trim(),
      stock: parseInt(stock, 10) || 0,
      dimensions: dimensions ? dimensions.trim() : null,
      finish: finish ? finish.trim() : null,
      material: material ? material.trim() : null,
      rating: rating ? parseFloat(rating).toFixed(1) : "4.8",
      featured: featured ? 1 : 0,
      isPopular: isPopular ? 1 : 0,
    });

    const created = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
