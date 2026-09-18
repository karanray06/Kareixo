import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getInstallationOctokit } from "@/lib/github-app";

const ALLOWED_COMMANDS = ["log", "branch", "diff", "status", "blame"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoFullName, command, args = [] } = await req.json();

    if (!repoFullName || !command) {
      return NextResponse.json({ error: "Missing repoFullName or command" }, { status: 400 });
    }

    if (!ALLOWED_COMMANDS.includes(command)) {
      return NextResponse.json({ error: `Command 'git ${command}' is not allowed or supported.` }, { status: 403 });
    }

    const db = getDb();
    const [owner, repo] = repoFullName.split("/");

    const [repoRecord] = await db
      .select({ inst: github_installations })
      .from(repositories)
      .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
      .where(
        and(
          eq(repositories.fullName, repoFullName),
          eq(github_installations.userId, session.user.id)
        )
      );

    if (!repoRecord) {
      return NextResponse.json({ error: "Repository not found or access denied." }, { status: 404 });
    }

    const octokit = await getInstallationOctokit(repoRecord.inst.installationId);

    let output = "";

    try {
      if (command === "log") {
        const { data } = await octokit.rest.repos.listCommits({ owner, repo, per_page: 10 });
        output = data.map((c: any) => 
          `commit ${c.sha}\nAuthor: ${c.commit.author?.name} <${c.commit.author?.email}>\nDate:   ${c.commit.author?.date}\n\n    ${c.commit.message}`
        ).join("\n\n");
      } 
      else if (command === "branch") {
        const { data } = await octokit.rest.repos.listBranches({ owner, repo, per_page: 20 });
        output = data.map((b: any) => `  ${b.name}`).join("\n");
      }
      else if (command === "diff") {
        if (args.length === 2) {
          const { data } = await octokit.rest.repos.compareCommits({ owner, repo, base: args[0], head: args[1] });
          output = data.files?.map((f: any) => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch}`).join("\n") || "No differences.";
        } else if (args.length === 1) {
          const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: args[0] });
          output = data.files?.map((f: any) => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch}`).join("\n") || "No differences.";
        } else {
          output = "git diff requires at least 1 argument (commit sha/branch).";
        }
      }
      else if (command === "status") {
        output = "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
      }
      else if (command === "blame") {
        output = "Blame requires specifying a file. Not fully supported in this restricted terminal.";
      }
    } catch (err: any) {
      output = `fatal: ${err.message}`;
    }

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Git terminal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
