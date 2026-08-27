import { db } from "../src/db";
import { products } from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function populateFullCatalogue() {
  const categoriesMap: Record<string, {
    category: string;
    prefix: string;
    name: string;
    count: number;
    start: number;
    dimensions: string;
    finish: string;
    material: string;
    price: number;
    desc: string;
  }> = {
    "gnam-wall": {
      category: "Digital Wall Tiles",
      prefix: "/products/catalog/gnam-wall-",
      name: "G-NAM Designer Wall Tile",
      count: 24,
      start: 4,
      dimensions: "300 x 450 mm",
      finish: "Digital Ceramic Glaze",
      material: "Ceramic Wall Tile",
      price: 680,
      desc: "Waterproof HD digital ceramic wall tile with high gloss finish and stain resistant nano-coating.",
    },
    "suncore-matt": {
      category: "Satin Matt",
      prefix: "/products/catalog/suncore-matt-",
      name: "NCT Satin Matt Tile",
      count: 12,
      start: 3,
      dimensions: "600 x 600 mm",
      finish: "Satin Matt Smooth",
      material: "Porcelain Vitrified",
      price: 1550,
      desc: "Satin matte porcelain tile with non-reflective smooth texture, high scratch resistance, and low porosity.",
    },
    "step-riser": {
      category: "Step & Riser",
      prefix: "/products/catalog/step-riser-",
      name: "G-NAM Bullnose Step & Riser Set",
      count: 8,
      start: 3,
      dimensions: "1200 x 300 mm Step + 1200 x 200 mm Riser",
      finish: "Anti-Skid Full Bullnose",
      material: "Heavy Vitrified Tile",
      price: 540,
      desc: "Precision rounded bullnose tread and matching riser with anti-skid grooved safety grip lines.",
    },
    "hindware": {
      category: "Sanitaryware & Faucets",
      prefix: "/products/catalog/hindware-",
      name: "Hindware Italian Series",
      count: 18,
      start: 3,
      dimensions: "Luxury Bathroom Spec",
      finish: "Alpine White / Brushed Metal",
      material: "Vitreous China & Brass",
      price: 3800,
      desc: "Premium Italian sanitaryware and tapware engineered for water efficiency and modern bathroom aesthetics.",
    },
    "bhatia-catalogue": {
      category: "Vitrified Floor Tiles",
      prefix: "/products/catalog/bhatia-catalogue-",
      name: "Bhatia Signature Collection Tile",
      count: 14,
      start: 1,
      dimensions: "600 x 600 mm",
      finish: "Vitrified Mirror Polish",
      material: "Glazed Porcelain",
      price: 950,
      desc: "Curated vitrified floor tile design from the signature Bhatia Stores showroom catalogue.",
    },
  };

  let added = 0;
  for (const [key, conf] of Object.entries(categoriesMap)) {
    for (let i = conf.start; i <= conf.count; i++) {
      const pad = String(i).padStart(2, "0");
      const img = `${conf.prefix}${pad}.jpg`;
      const name = `${conf.name} - Pattern ${pad}`;

      const existing = await db.select().from(products).where(eq(products.name, name)).limit(1);
      if (existing[0]) continue;

      const price = conf.price + ((i % 5) * 40);
      const rating = (4.6 + (i % 4) * 0.1).toFixed(1);

      await db.insert(products).values({
        id: uuidv4(),
        name,
        description: `${conf.desc} Pattern code ${key.toUpperCase()}-${pad}. Available for direct showroom delivery.`,
        price: price.toFixed(2),
        image: img,
        images: [img],
        category: conf.category,
        stock: 40 + (i * 7) % 80,
        dimensions: conf.dimensions,
        finish: conf.finish,
        material: conf.material,
        rating,
        featured: i % 4 === 0 ? 1 : 0,
        isPopular: i % 3 === 0 ? 1 : 0,
      });
      added++;
    }
  }

  console.log(`Added ${added} extra catalogue products.`);
}

populateFullCatalogue().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
