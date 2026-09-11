import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();

  const result = await client.query(`
    SELECT id, name, image
    FROM products
    WHERE image LIKE '/products/new-stock/%'
    ORDER BY name
  `);

  console.table(result.rows);
} finally {
  await client.end();
}
