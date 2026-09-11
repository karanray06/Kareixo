import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { repositories, github_installations, reviews } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

    const db = getDb();

    // Get user's repo IDs through installations
    const userRepos = await db
      .select({ id: repositories.id, fullName: repositories.fullName })
      .from(repositories)
      .innerJoin(
        github_installations,
        eq(repositories.installationId, github_installations.installationId)
      )
      .where(eq(github_installations.userId, session.user.id));

    if (userRepos.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    const repoIds = userRepos.map((r) => r.id);
    const repoNameMap = Object.fromEntries(userRepos.map((r) => [r.id, r.fullName]));

    const userReviews = await db
      .select()
      .from(reviews)
      .where(inArray(reviews.repositoryId, repoIds))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);

    const enrichedReviews = userReviews.map((review) => ({
      ...review,
      repoFullName: repoNameMap[review.repositoryId] || "unknown",
    }));

    return NextResponse.json({ reviews: enrichedReviews });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
