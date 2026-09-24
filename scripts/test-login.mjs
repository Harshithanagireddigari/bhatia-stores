import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const userRes = await client.query("SELECT * FROM users WHERE email = $1", ["harshithanagireddigari@gmail.com"]);
console.log("User found:", userRes.rows[0] ? userRes.rows[0].email : "NONE");

if (userRes.rows[0]) {
  console.log("Hashed pass:", userRes.rows[0].password);
}

await client.end();
