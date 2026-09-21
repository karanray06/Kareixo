import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

export const maxDuration = 60;
import crypto from "crypto";
import { getDb } from "@/db";
import { github_installations, repositories, reviews, feedback } from "@/db/schema";
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
        waitUntil(queueReview(installationId, repoFullName, prNumber).catch((err) => {
          console.error(`Unhandled error in queueReview for ${repoFullName}#${prNumber}`, err);
        }));
        
        return NextResponse.json({ queued: true });
      }
    }

    if (event === "issue_comment") {
      const action = payload.action;
      if (action === "created") {
        const commentBody = payload.comment.body?.trim();
        const isFeedback = commentBody?.startsWith("/kareixo useful") || commentBody?.startsWith("/kareixo not-useful");
        
        if (isFeedback) {
          const signal = commentBody.startsWith("/kareixo useful") ? "useful" : "not-useful";
          const repoFullName = payload.repository.full_name;
          const prNumber = payload.issue.number;
          const installationId = payload.installation.id;
          const commentId = payload.comment.in_reply_to_id || payload.comment.id; // Best effort

          waitUntil((async () => {
            const [repository] = await db.select().from(repositories).where(
              eq(repositories.fullName, repoFullName)
            );
            if (repository) {
              await db.insert(feedback).values({
                repositoryId: repository.id,
                prNumber,
                commentId,
                signal,
              });
              
              // Acknowledge the feedback
              const { getInstallationOctokit } = await import("@/lib/github-app");
              const octokit = await getInstallationOctokit(installationId);
              const [owner, repo] = repoFullName.split("/");
              await octokit.rest.reactions.createForIssueComment({
                owner,
                repo,
                comment_id: payload.comment.id,
                content: "+1"
              });
            }
          })().catch(console.error));
          
          return NextResponse.json({ feedback_logged: true });
        }
      }
    }

    if (event === "check_run") {
      const action = payload.action;
      if (action === "completed" && payload.check_run.conclusion === "failure") {
        // Skip Kareixo's own check runs to avoid infinite loops
        if (payload.check_run.name?.includes("Kareixo")) {
          return NextResponse.json({ ignored: true, reason: "Own check run" });
        }

        const repoFullName = payload.repository.full_name;
        const installationId = payload.installation.id;
        const headSha = payload.check_run.head_sha;
        const prNumber = payload.check_run.pull_requests?.[0]?.number;
        const branch = payload.check_run.pull_requests?.[0]?.head?.ref
          || payload.check_run.check_suite?.head_branch;

        if (branch) {
          const [owner, repo] = repoFullName.split("/");
          const { executeHealingLoop } = await import("@/lib/healing-loop");

          waitUntil(
            executeHealingLoop({
              installationId,
              owner,
              repo,
              branch,
              headSha,
              prNumber,
              failedJobName: payload.check_run.name,
            }).catch((err) => {
              console.error(`Unhandled error in healing loop for ${repoFullName}:`, err);
            })
          );

          return NextResponse.json({ healing: true, branch, prNumber });
        }
      }

      return NextResponse.json({ ignored: true });
    }

    return NextResponse.json({ ignored: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
