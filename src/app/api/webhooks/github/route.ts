import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/db";
import { github_installations, repositories, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    if (event === "installation" || event === "installation_repositories") {
      const action = payload.action;
      const installationId = payload.installation.id;
      
      if (action === "created") {
        console.log(`Installed app ${installationId}`);
      }

      if (payload.repositories_added) {
        for (const repo of payload.repositories_added) {
          console.log(`Added repo ${repo.full_name}`);
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

        console.log(`PR ${action}: ${repoFullName}#${prNumber}`);
        // import { queueReview } from "@/lib/review-generator";
        // queueReview(installationId, repoFullName, prNumber).catch(console.error);
        
        return NextResponse.json({ queued: true });
      }
    }

    return NextResponse.json({ ignored: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
