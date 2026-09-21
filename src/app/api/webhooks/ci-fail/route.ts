import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import crypto from "crypto";
import { executeHealingLoop } from "@/lib/healing-loop";

export const maxDuration = 60;

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

function verifySignature(req: Request, rawBody: string): boolean {
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature || !WEBHOOK_SECRET) return false;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * CI Failure Webhook — triggered by GitHub check_run or workflow_run failures.
 *
 * Can be called directly by a GitHub Actions workflow using:
 *   curl -X POST https://kareixo.dev/api/webhooks/ci-fail \
 *     -H "Content-Type: application/json" \
 *     -d '{ "installationId": ..., "owner": "...", "repo": "...", ... }'
 *
 * Or via the main GitHub webhook (check_run event forwarding).
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const event = req.headers.get("x-github-event");

  // If it's a GitHub webhook event, verify signature
  if (event) {
    if (!verifySignature(req, rawBody)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);

    // Handle GitHub check_run completed with failure
    if (event === "check_run" && payload.action === "completed") {
      if (payload.check_run.conclusion !== "failure") {
        return NextResponse.json({ ignored: true, reason: "Not a failure" });
      }

      // Skip Kareixo's own check runs to avoid infinite loops
      if (payload.check_run.name?.includes("Kareixo")) {
        return NextResponse.json({ ignored: true, reason: "Own check run" });
      }

      const installationId = payload.installation?.id;
      const repoFullName = payload.repository?.full_name;
      const headSha = payload.check_run.head_sha;

      if (!installationId || !repoFullName || !headSha) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const [owner, repo] = repoFullName.split("/");

      // Find the PR associated with this check run
      const prNumber = payload.check_run.pull_requests?.[0]?.number;
      const branch = payload.check_run.pull_requests?.[0]?.head?.ref
        || payload.check_run.check_suite?.head_branch;

      if (!branch) {
        return NextResponse.json({ ignored: true, reason: "No branch found" });
      }

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
          console.error(`[CI-Fail Webhook] Healing loop failed for ${repoFullName}:`, err);
        })
      );

      return NextResponse.json({ healing: true, branch, prNumber });
    }

    // Handle direct API calls (e.g., from a GitHub Actions workflow)
    if (!event) {
      const { installationId, owner, repo, branch, headSha, prNumber, failedJobName } = payload;

      if (!installationId || !owner || !repo || !branch || !headSha) {
        return NextResponse.json(
          { error: "Missing required fields: installationId, owner, repo, branch, headSha" },
          { status: 400 }
        );
      }

      waitUntil(
        executeHealingLoop({
          installationId,
          owner,
          repo,
          branch,
          headSha,
          prNumber,
          failedJobName,
        }).catch((err) => {
          console.error(`[CI-Fail Webhook] Healing loop failed for ${owner}/${repo}:`, err);
        })
      );

      return NextResponse.json({ healing: true, branch, prNumber });
    }

    return NextResponse.json({ ignored: true });
  } catch (error) {
    console.error("[CI-Fail Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
