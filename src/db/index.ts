import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// pg will change the meaning of sslmode=require in its next major release.
// Keep the current strict, certificate-and-hostname-verified connection
// behavior explicit without requiring a developer to expose or rewrite the
// database secret in .env.local.
const connectionUrl = new URL(databaseUrl);
if (["prefer", "require", "verify-ca"].includes(connectionUrl.searchParams.get("sslmode") ?? "")) {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: connectionUrl.toString(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
