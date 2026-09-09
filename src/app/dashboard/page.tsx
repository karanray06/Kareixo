import { getDb } from "@/db";
import { github_installations, repositories, reviews } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const db = getDb();
  const userId = session.user.id;

  // 1. Fetch Connected Repositories
  const repos = await db
    .select({
      repo: repositories,
      install: github_installations,
    })
    .from(repositories)
    .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
    .where(eq(github_installations.userId, userId));

  // 2. Fetch Recent Activity
  const recentReviews = await db
    .select({
      review: reviews,
      repo: repositories,
    })
    .from(reviews)
    .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
    .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
    .where(eq(github_installations.userId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  // 3. Aggregate Stats
  const [stats] = await db
    .select({
      totalReviews: sql<number>`count(*)`,
      totalFindings: sql<number>`sum(${reviews.findingCount})`,
    })
    .from(reviews)
    .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
    .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
    .where(eq(github_installations.userId, userId));

  const totalReviews = Number(stats?.totalReviews || 0);
  const totalFindings = Number(stats?.totalFindings || 0);

  const getRelativeTime = (date: Date | null) => {
    if (!date) return "Unknown time";
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const now = new Date();
    const daysDiff = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      const hoursDiff = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (hoursDiff === 0) {
        const mins = Math.round((date.getTime() - now.getTime()) / (1000 * 60));
        return rtf.format(mins, "minute");
      }
      return rtf.format(hoursDiff, "hour");
    }
    return rtf.format(daysDiff, "day");
  };

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Good evening, {session.user.name?.split(' ')[0] || 'developer'}.</h1>
        <p className="text-[var(--text-secondary)] mt-1">Here's what's happening across your repositories.</p>
      </header>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Reviews</p>
          <p className="text-2xl font-semibold">{totalReviews}</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Findings</p>
          <p className="text-2xl font-semibold">{totalFindings}</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Repositories</p>
          <p className="text-2xl font-semibold">{repos.length}</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Resolved</p>
          <p className="text-2xl font-semibold">0</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* ── Recent Activity ── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden">
            {recentReviews.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                No recent activity. Open a pull request to trigger a review.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-base)]">
                {recentReviews.map(({ review, repo }) => (
                  <div key={review.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-subtle)] transition-colors">
                    <div className="flex items-center gap-4">
                      {review.status === 'failed' ? (
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <XCircle size={16} className="text-red-600" />
                        </div>
                      ) : (review.findingCount ?? 0) > 0 ? (
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <AlertCircle size={16} className="text-orange-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium">
                          {repo.fullName} <span className="text-[var(--text-muted)] font-normal">#{review.prNumber}</span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-0.5">
                          <span>{getRelativeTime(review.createdAt)}</span>
                          {(review.findingCount ?? 0) > 0 && (
                            <>
                              <span>&middot;</span>
                              <span className="text-orange-600 font-medium">{review.findingCount ?? 0} findings</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Repositories ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Repositories</h2>
            <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Manage</a>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden">
            {repos.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[var(--text-secondary)] mb-4">No repositories connected.</p>
                <a href="https://github.com/apps/kareixo-reviewer/installations/new" className="btn btn-primary text-xs w-full">
                  Connect GitHub
                </a>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-base)]">
                {repos.map(({ repo }) => (
                  <div key={repo.id} className="p-4 flex items-center gap-3">
                    <FiGithub size={16} className="text-[var(--text-muted)]" />
                    <Link href={`/dashboard/${repo.id}`} className="text-sm font-medium hover:underline">
                      {repo.fullName.split('/')[1]}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
