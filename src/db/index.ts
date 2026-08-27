import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Patch Node fs methods so that Next.js Turbopack web worker URL instances convert safely to file paths
if (typeof fs !== "undefined") {
  const patchFn = (fnName: keyof typeof fs) => {
    const orig = (fs as any)[fnName];
    if (typeof orig === "function") {
      (fs as any)[fnName] = function (p: any, ...args: any[]) {
        if (p && typeof p === "object" && typeof p.href === "string" && p.protocol === "file:") {
          try {
            p = fileURLToPath(p);
          } catch {}
        }
        return orig.call(this, p, ...args);
      };
    }
  };

  [
    "readFile",
    "readFileSync",
    "open",
    "openSync",
    "stat",
    "statSync",
    "lstat",
    "lstatSync",
    "access",
    "accessSync",
    "existsSync",
  ].forEach((k) => patchFn(k as any));
}

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaDb?: any;
  __arenaPgliteClient?: PGlite;
  __arenaPgPool?: Pool;
};

function initDb() {
  if (databaseUrl && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
    const pool =
      globalForDb.__arenaPgPool ??
      new Pool({
        connectionString: databaseUrl,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaPgPool = pool;
    }

    return drizzlePg(pool, { schema });
  }

  // Fallback to embedded persistent PGlite
  const dataDir = path.join(process.cwd(), "data", "pglite");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite =
    globalForDb.__arenaPgliteClient ??
    new PGlite(dataDir);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaPgliteClient = pglite;
  }

  return drizzlePglite(pglite, { schema });
}

export const db = globalForDb.__arenaDb ?? initDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaDb = db;
}
