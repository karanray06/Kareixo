import { getDb } from "./src/db/index";
import { github_installations } from "./src/db/schema";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const db = getDb();
  try {
    const sessionUserId = '748d70f6-7d4a-4529-9359-f0f879f3fe4c'; // The user from check_db
    const installationNumber = 162552091; // The installation from check_db
    
    await db
      .insert(github_installations)
      .values({
        installationId: installationNumber,
        userId: sessionUserId,
        accountLogin: "test-login",
      })
      .onConflictDoUpdate({
        target: github_installations.installationId,
        set: {
          userId: sessionUserId,
        },
      });
      
    console.log("Upsert succeeded");
  } catch (e) {
    console.error("Upsert failed:", e);
  }
  process.exit(0);
}

test().catch(console.error);
