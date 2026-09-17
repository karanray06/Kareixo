import { getDb } from "./src/db/index";
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
dotenv.config({ path: '.env.local' });

async function resetSchema() {
  const db = getDb();
  await db.execute(sql`DROP TABLE IF EXISTS "feedback" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "reviews" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "repositories" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "github_installations" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "provider_stats" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "projects" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "files" CASCADE;`);
  console.log("Dropped tables with cascade.");
  process.exit(0);
}

resetSchema().catch(console.error);
