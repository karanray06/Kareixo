import { getDb } from "./src/db/index";
import { users } from "./src/db/schema";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const db = getDb();
  
  try {
    const allUsers = await db.select().from(users);
    console.log("Users:", allUsers);
  } catch (e) {
    console.error("Users fetch error", e);
  }
  
  process.exit(0);
}

check().catch(console.error);
