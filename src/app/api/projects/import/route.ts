import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { projects, files } from "@/db/schema";

// Limit file count and size to avoid overwhelming the DB
const MAX_FILES = 80;
const MAX_FILE_SIZE = 100_000; // 100KB per file
const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".next", "__pycache__", ".venv", "vendor"];
const TEXT_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".scss",
  ".html", ".yml", ".yaml", ".toml", ".env", ".txt", ".py",
  ".rs", ".go", ".java", ".rb", ".php", ".sh", ".bat", ".sql",
  ".graphql", ".prisma", ".svelte", ".vue", ".astro",
];

export async function POST(req: Request) {
  try {
    const session: any = await auth();
    const token = await getToken({
      req: req as any,
      secret: process.env.AUTH_SECRET as string,
      salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
    });
    const accessToken = token?.accessToken;

    if (!session?.user?.id || !accessToken) {
      return NextResponse.json({ error: "Unauthorized or missing GitHub access token" }, { status: 401 });
    }

    const { repo, branch = "main" } = await req.json();
    // repo should be "owner/repo" format
    if (!repo || !repo.includes("/")) {
      return NextResponse.json({ error: "Invalid repo format. Use owner/repo." }, { status: 400 });
    }

    // 1. Fetch the file tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return NextResponse.json(
        { error: `Failed to fetch repo tree: ${treeRes.status} ${errText}` },
        { status: treeRes.status }
      );
    }

    const treeData = await treeRes.json();
    const blobs = (treeData.tree || []).filter((item: any) => {
      if (item.type !== "blob") return false;
      // Skip binary / large files
      if (item.size > MAX_FILE_SIZE) return false;
      // Skip known non-text directories
      const parts = item.path.split("/");
      if (parts.some((p: string) => SKIP_DIRS.includes(p))) return false;
      // Only include known text extensions or extensionless config files
      const ext = "." + item.path.split(".").pop();
      const basename = item.path.split("/").pop() || "";
      if (TEXT_EXTENSIONS.includes(ext) || ["Dockerfile", "Makefile", ".gitignore", ".eslintrc"].includes(basename)) {
        return true;
      }
      return false;
    }).slice(0, MAX_FILES);

    // 2. Fetch file contents in parallel (batches of 10)
    const fileEntries: { path: string; content: string }[] = [];

    for (let i = 0; i < blobs.length; i += 10) {
      const batch = blobs.slice(i, i + 10);
      const results = await Promise.allSettled(
        batch.map(async (blob: any) => {
          const contentRes = await fetch(
            `https://api.github.com/repos/${repo}/contents/${blob.path}?ref=${branch}`,
            {
              headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github.v3.raw",
              },
            }
          );
          if (!contentRes.ok) return null;
          const text = await contentRes.text();
          return { path: blob.path, content: text };
        })
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          fileEntries.push(r.value);
        }
      }
    }

    // 3. Create the project in the database
    const db = getDb();
    const repoName = repo.split("/").pop() || repo;
    const [project] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        name: repoName,
        githubRepo: repo,
        githubBranch: branch,
      })
      .returning();

    // 4. Insert all files
    if (fileEntries.length > 0) {
      await db.insert(files).values(
        fileEntries.map((f) => ({
          projectId: project.id,
          path: f.path,
          content: f.content,
        }))
      );
    }

    return NextResponse.json({
      ...project,
      fileCount: fileEntries.length,
    }, { status: 201 });

  } catch (error: any) {
    console.error("[Import API] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
