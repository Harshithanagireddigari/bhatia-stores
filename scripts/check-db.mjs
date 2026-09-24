import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
console.log("DB Tables:", tables.rows.map(r => r.table_name));

try {
  const users = await client.query("SELECT id, email, role FROM users LIMIT 5");
  console.log("Users:", users.rows);
} catch (e) {
  console.error("Error querying users:", e.message);
}

try {
  const rateLimits = await client.query("SELECT * FROM rate_limits LIMIT 5");
  console.log("Rate limits:", rateLimits.rows);
} catch (e) {
  console.error("Error querying rate_limits:", e.message);
}

try {
  const sessions = await client.query("SELECT * FROM sessions LIMIT 5");
  console.log("Sessions:", sessions.rows);
} catch (e) {
  console.error("Error querying sessions:", e.message);
}

await client.end();
