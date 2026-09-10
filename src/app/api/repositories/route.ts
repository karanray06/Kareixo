import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { repositories, github_installations, reviews } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Fetch all repositories for the user's installations
    const userRepos = await db
      .select({ repo: repositories, inst: github_installations })
      .from(repositories)
      .innerJoin(
        github_installations,
        eq(repositories.installationId, github_installations.installationId)
      )
      .where(eq(github_installations.userId, session.user.id));

    // Format output
    const formattedRepos = userRepos.map(({ repo }) => ({
      id: repo.id,
      githubRepoId: repo.githubRepoId,
      fullName: repo.fullName,
      enabledCategories: JSON.parse(repo.enabledCategories || "[]"),
      preferredTier: repo.preferredTier,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
    }));

    const repoIds = formattedRepos.map(r => r.id);

    // Fetch reviews for aggregates
    let userReviews: any[] = [];
    if (repoIds.length > 0) {
      userReviews = await db
        .select()
        .from(reviews)
        .where(inArray(reviews.repositoryId, repoIds))
        .orderBy(desc(reviews.createdAt))
        .limit(50); // Get latest 50 for stats
    }

    const totalReviews = userReviews.length;
    const passedClean = userReviews.filter(r => r.findingCount === 0).length;
    const activeFindings = userReviews.reduce((sum, r) => sum + (r.findingCount || 0), 0);
    const avgReviewTime = "18s"; // Static for now as we don't track start/end times in DB

    return NextResponse.json({
      repositories: formattedRepos,
      stats: {
        totalReviews,
        passedClean,
        activeFindings,
        avgReviewTime
      },
      recentReviews: userReviews.slice(0, 5)
    });
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
