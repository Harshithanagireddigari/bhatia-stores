import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const result = await client.query(
  `UPDATE products
   SET category = CASE
     WHEN lower(name) LIKE '%wall%' OR lower(description) LIKE '%wall tile%' THEN 'Wall Tiles'
     ELSE 'Floor Tiles'
   END
   WHERE category = 'Tiles & Sanitaryware'`,
);

await client.end();
console.log(`Moved ${result.rowCount} legacy products into Floor Tiles or Wall Tiles.`);
