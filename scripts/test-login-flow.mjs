import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

console.log("Testing rate_limits query...");
try {
  const key = "login:shared";
  const resetAt = new Date(Date.now() + 15 * 60_000);
  const res = await client.query(`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES ($1, 1, $2)
    ON CONFLICT (key)
    DO UPDATE SET
      count = CASE
        WHEN rate_limits.reset_at <= NOW() THEN 1
        ELSE rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN rate_limits.reset_at <= NOW() THEN $2
        ELSE rate_limits.reset_at
      END
    RETURNING count;
  `, [key, resetAt]);
  console.log("Rate limit query result:", res.rows);
} catch (e) {
  console.error("Rate limit query FAILED:", e);
}

await client.end();
