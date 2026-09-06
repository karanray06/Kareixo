import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { repositories, github_installations, chatConversations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { parseStackTrace } from "@/lib/trace-parser";
import { resolveIncident } from "@/lib/incident-resolver";

export const maxDuration = 60;

/**
 * Incident Tracer API — accepts a stack trace, resolves it to commits/PRs,
 * and creates a CodeChat session pre-loaded with the incident context.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stackTrace, repoFullName, branch = "main" } = await req.json();

    if (!stackTrace || !repoFullName) {
      return NextResponse.json(
        { error: "stackTrace and repoFullName are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this repo
    const db = getDb();
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

    // 1. Parse the stack trace
    const frames = parseStackTrace(stackTrace);
    
    if (frames.length === 0) {
      return NextResponse.json({
        error: "No project-relevant frames found in the stack trace. Make sure the trace includes file paths from your project.",
        frames: [],
      }, { status: 422 });
    }

    // 2. Resolve frames to commits and PRs
    const context = await resolveIncident(
      repoRecord.inst.installationId,
      repoFullName,
      frames,
      stackTrace,
      branch
    );

    // 3. Create a CodeChat session pre-loaded with this context
    const [newConversation] = await db.insert(chatConversations).values({
      userId: session.user.id,
      title: `Incident: ${frames[0].filePath}:${frames[0].lineNumber}`,
      repoFullName,
      branch,
      preloadedContext: JSON.stringify(context),
    }).returning({ id: chatConversations.id });

    return NextResponse.json({
      conversationId: newConversation.id,
      context,
      codeChatUrl: `/codechat?incident=${newConversation.id}&repo=${encodeURIComponent(repoFullName)}`,
    });

  } catch (error: any) {
    console.error("Incident tracer error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze incident" },
      { status: 500 }
    );
  }
}
