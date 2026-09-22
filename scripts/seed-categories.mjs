import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const starterCategories = [
  ["floor-tiles", "Floor Tiles", "floor-tiles", "Premium floor tiles for every room.", 1],
  ["wall-tiles", "Wall Tiles", "wall-tiles", "Wall tiles for kitchens, bathrooms, and feature walls.", 2],
  ["bathroom-tiles", "Bathroom Tiles", "bathroom-tiles", "Durable bathroom tiles in considered finishes.", 3],
  ["sanitaryware", "Sanitaryware", "sanitaryware", "Premium sanitaryware for modern bathrooms.", 4],
  ["faucets-taps", "Faucets & Taps", "faucets-taps", "Faucets and taps for refined daily routines.", 5],
  ["wash-basins", "Wash Basins", "wash-basins", "Wash basins with practical, lasting design.", 6],
  ["toilets-wc", "Toilets & WC", "toilets-wc", "Toilets and WC solutions for every bathroom.", 7],
  ["bathroom-accessories", "Bathroom Accessories", "bathroom-accessories", "Thoughtful bathroom finishing accessories.", 8],
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
for (const [id, name, slug, description, sortOrder] of starterCategories) {
  await client.query(
    `INSERT INTO categories (id, name, slug, description, is_visible, display_on_homepage, display_in_shop, sort_order)
     VALUES ($1, $2, $3, $4, 1, 1, 1, $5)
     ON CONFLICT (name) DO NOTHING`,
    [id, name, slug, description, sortOrder],
  );
}
await client.end();
console.log("Starter categories are ready.");
