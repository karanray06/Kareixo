import { getDb } from "./src/db/index";
import { github_installations, repositories } from "./src/db/schema";
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
dotenv.config({ path: '.env.local' });

async function check() {
  const db = getDb();
  
  try {
    const allInstalls = await db.select().from(github_installations);
    console.log("\nInstallations:", allInstalls);
  } catch (e) {
    console.error("Installations fetch error", e);
  }
  
  try {
    const allRepos = await db.select().from(repositories);
    console.log("\nRepositories:", allRepos);
  } catch (e) {
    console.error("Repos fetch error", e);
  }
  
  process.exit(0);
}

check().catch(console.error);
