import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function cleanupAdminTeam() {
  await client.connect();
  console.log("Cleaning up fake admin team entries...");
  await client.query("DELETE FROM admin_team WHERE email IN ('rahul@bhatia.com', 'priya@bhatia.com')");
  const res = await client.query("SELECT * FROM admin_team");
  console.log("Current Admin Team in DB:", res.rows);
  await client.end();
}

cleanupAdminTeam().catch(console.error);
