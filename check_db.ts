import { getDb } from "./src/db/index";
import { users, github_installations, repositories } from "./src/db/schema";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const db = getDb();
  
  try {
    const allUsers = await db.select().from(users);
    console.log("\nUsers:");
    console.dir(allUsers, { depth: null });
  } catch (e) {
    console.error("Users fetch error", e);
  }
  
  try {
    const allInstalls = await db.select().from(github_installations);
    console.log("\nInstallations:");
    console.dir(allInstalls, { depth: null });
  } catch (e) {
    console.error("Installations fetch error", e);
  }
  
  try {
    const allRepos = await db.select().from(repositories);
    console.log("\nRepositories:");
    console.dir(allRepos, { depth: null });
  } catch (e) {
    console.error("Repos fetch error", e);
  }
  
  process.exit(0);
}

check().catch(console.error);
