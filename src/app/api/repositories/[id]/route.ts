import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const db = getDb();

    // Verify ownership
    const [repoWithAuth] = await db
      .select({ repo: repositories, inst: github_installations })
      .from(repositories)
      .innerJoin(
        github_installations,
        eq(repositories.installationId, github_installations.installationId)
      )
      .where(
        and(
          eq(repositories.id, id),
          eq(github_installations.userId, session.user.id)
        )
      );

    if (!repoWithAuth) {
      return NextResponse.json({ error: "Repository not found or unauthorized" }, { status: 404 });
    }

    const updates: Partial<typeof repositories.$inferInsert> = {};
    if (body.enabledCategories !== undefined) {
      updates.enabledCategories = JSON.stringify(body.enabledCategories);
    }
    if (body.preferredTier !== undefined) {
      updates.preferredTier = body.preferredTier;
    }
    if (body.customInstructions !== undefined) {
      updates.customInstructions = body.customInstructions;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await db
        .update(repositories)
        .set(updates)
        .where(eq(repositories.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update repository:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
