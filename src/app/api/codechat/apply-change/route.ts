import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getInstallationOctokit } from "@/lib/github-app";
import { createBranchAndPR, getDefaultBranch } from "@/lib/github-writer";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const maxDuration = 30;

/**
 * Apply a proposed code change: creates a branch, commits the file, and opens a PR.
 *
 * Body: { repoFullName, path, newContent, baseSha, explanation }
 * Returns: { prUrl, prNumber, branchName }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(session.user.id);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const { repoFullName, path, newContent, baseSha, explanation } =
      await req.json();

    if (!repoFullName || !path || !newContent) {
      return NextResponse.json(
        { error: "repoFullName, path, and newContent are required" },
        { status: 400 }
      );
    }

    // Verify the user owns this repository through their GitHub installation
    const db = getDb();
    const [owner, repo] = repoFullName.split("/");

    const [repoRecord] = await db
      .select({ repo: repositories, inst: github_installations })
      .from(repositories)
      .innerJoin(
        github_installations,
        eq(repositories.installationId, github_installations.installationId)
      )
      .where(
        and(
          eq(repositories.fullName, repoFullName),
          eq(github_installations.userId, session.user.id)
        )
      );

    if (!repoRecord) {
      return NextResponse.json(
        { error: "Repository not found or unauthorized" },
        { status: 404 }
      );
    }

    const octokit = await getInstallationOctokit(
      repoRecord.inst.installationId
    );

    // Get the default branch
    const defaultBranch = await getDefaultBranch(octokit, owner, repo);

    // Create branch, commit, and open PR
    const result = await createBranchAndPR({
      octokit,
      owner,
      repo,
      path,
      content: newContent,
      baseSha: baseSha || "",
      message: `Update ${path}`,
      explanation: explanation || "CodeChat-proposed change",
      defaultBranch,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Apply change error:", error);

    // Surface permission errors clearly
    if (error?.message?.includes("re-approve permissions")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to apply change" },
      { status: 500 }
    );
  }
}
