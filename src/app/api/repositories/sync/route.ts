import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { getInstallationOctokit } from "@/lib/github-app";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // 1. Fetch user's installations
    const userInstallations = await db
      .select()
      .from(github_installations)
      .where(eq(github_installations.userId, session.user.id));

    if (userInstallations.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;

    // 2. Fetch and sync repos for each installation
    for (const inst of userInstallations) {
      try {
        const octokit = await getInstallationOctokit(inst.installationId);
        
        // Fetch all repos accessible to this installation
        const { data } = await octokit.request("GET /installation/repositories");
        
        if (!data.repositories || data.repositories.length === 0) {
          continue;
        }

        // Fetch existing repos in DB for this installation
        const existingRepos = await db
          .select({ githubRepoId: repositories.githubRepoId })
          .from(repositories)
          .where(eq(repositories.installationId, inst.installationId));
        
        const existingRepoIds = new Set(existingRepos.map(r => r.githubRepoId));

        // Find missing repos
        const reposToInsert = data.repositories
          .filter(r => !existingRepoIds.has(r.id))
          .map(r => ({
            installationId: inst.installationId,
            githubRepoId: r.id,
            fullName: r.full_name,
            enabledCategories: JSON.stringify(["logic", "security", "style"]),
            preferredTier: "fast",
          }));

        if (reposToInsert.length > 0) {
          await db.insert(repositories).values(reposToInsert);
          syncedCount += reposToInsert.length;
        }

        // Handle renames? The prompt says "updates your DB records (repo renames, removals, new grants)"
        // To be safe, we can update full_name for existing repos
        const reposToUpdate = data.repositories.filter(r => existingRepoIds.has(r.id));
        for (const repo of reposToUpdate) {
          await db
            .update(repositories)
            .set({ fullName: repo.full_name })
            .where(
              eq(repositories.githubRepoId, repo.id)
            );
        }

        // Handle removals
        const currentGithubIds = new Set(data.repositories.map(r => r.id));
        const reposToRemove = existingRepos.filter(r => !currentGithubIds.has(r.githubRepoId));
        if (reposToRemove.length > 0) {
          await db
            .delete(repositories)
            .where(
              inArray(repositories.githubRepoId, reposToRemove.map(r => r.githubRepoId))
            );
        }

      } catch (err) {
        console.error(`Failed to sync installation ${inst.installationId}:`, err);
      }
    }

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error) {
    console.error("Failed to sync repositories:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
