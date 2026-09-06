import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getInstallationOctokit } from "@/lib/github-app";

/**
 * File API for CodeChat's file explorer.
 * Lists directories and reads files from the user's connected repos via GitHub API.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoFullName, path: filePath = "", branch = "HEAD", readFile = false } = await req.json();

    if (!repoFullName) {
      return NextResponse.json({ error: "repoFullName is required" }, { status: 400 });
    }

    const db = getDb();
    const [owner, repo] = repoFullName.split("/");

    // Verify the user has access to this repo
    const [repoRecord] = await db.select({ repo: repositories, inst: github_installations })
      .from(repositories)
      .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
      .where(
        and(
          eq(repositories.fullName, repoFullName),
          eq(github_installations.userId, session.user.id)
        )
      );

    if (!repoRecord) {
      return NextResponse.json({ error: "Repository not found or unauthorized" }, { status: 404 });
    }

    const octokit = await getInstallationOctokit(repoRecord.inst.installationId);

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });

    if (Array.isArray(data)) {
      // Directory listing
      return NextResponse.json({
        path: filePath || "/",
        entries: data.map((item: any) => ({
          name: item.name,
          type: item.type,
          size: item.size,
          path: item.path,
        })),
      });
    }

    if (readFile && data.type === "file") {
      // File content
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return NextResponse.json({
        path: filePath,
        content: content.length > 100000 ? content.slice(0, 100000) + "\n\n... [truncated]" : content,
        sha: data.sha,
        size: data.size,
      });
    }

    return NextResponse.json({ error: "Not a file" }, { status: 400 });

  } catch (error: any) {
    console.error("CodeChat files API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch file" },
      { status: error?.status || 500 }
    );
  }
}
