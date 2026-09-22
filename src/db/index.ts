import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/dummy_build";

let connectionString = databaseUrl;
try {
  const connectionUrl = new URL(databaseUrl);
  if (
    ["prefer", "require", "verify-ca"].includes(
      connectionUrl.searchParams.get("sslmode") ?? ""
    )
  ) {
    connectionUrl.searchParams.set("sslmode", "verify-full");
  }
  connectionString = connectionUrl.toString();
} catch {
  // Use raw connection string if not a valid URL yet
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
