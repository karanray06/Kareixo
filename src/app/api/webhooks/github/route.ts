import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/db";
import { github_installations, repositories, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

import { queueReview } from "@/lib/review-generator";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

function verifySignature(req: Request, rawBody: string) {
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature || !WEBHOOK_SECRET) return false;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  
  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  const payload = JSON.parse(rawBody);

  try {
    const db = getDb();

    if (event === "installation") {
      const action = payload.action;
      const installationId = payload.installation.id;
      const accountLogin = payload.installation.account.login;
      
      if (action === "created") {
        await db.insert(github_installations).values({
          installationId,
          accountLogin,
        }).onConflictDoUpdate({
          target: github_installations.installationId,
          set: { accountLogin, updatedAt: new Date() }
        });
        
        if (payload.repositories) {
          for (const repo of payload.repositories) {
            await db.insert(repositories).values({
              installationId,
              githubRepoId: repo.id,
              fullName: repo.full_name,
            }).onConflictDoNothing();
          }
        }
      } else if (action === "deleted") {
        // Cascade deleting repos and installation
        await db.delete(repositories).where(eq(repositories.installationId, installationId));
        await db.delete(github_installations).where(eq(github_installations.installationId, installationId));
      }
      
      return NextResponse.json({ success: true });
    }

    if (event === "installation_repositories") {
      const installationId = payload.installation.id;
      
      if (payload.repositories_added) {
        for (const repo of payload.repositories_added) {
          await db.insert(repositories).values({
            installationId,
            githubRepoId: repo.id,
            fullName: repo.full_name,
          }).onConflictDoNothing();
        }
      }
      if (payload.repositories_removed) {
        for (const repo of payload.repositories_removed) {
          await db.delete(repositories).where(eq(repositories.githubRepoId, repo.id));
        }
      }
      
      return NextResponse.json({ success: true });
    }

    if (event === "pull_request") {
      const action = payload.action;
      if (action === "opened" || action === "synchronize") {
        const repoFullName = payload.repository.full_name;
        const prNumber = payload.pull_request.number;
        const installationId = payload.installation.id;

        // Queue review asynchronously
        queueReview(installationId, repoFullName, prNumber).catch(console.error);
        
        return NextResponse.json({ queued: true });
      }
    }

    return NextResponse.json({ ignored: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
