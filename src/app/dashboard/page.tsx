import Navbar from "@/components/landing/Navbar";
import { FiGithub, FiCheckCircle, FiActivity, FiXCircle } from "react-icons/fi";
import { getDb } from "@/db";
import { github_installations, repositories, reviews } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth-helpers";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // We need to fetch real DB data.
  // In a real app with Auth, we would scope this to the logged-in user:
  // const session = await requireSession();
  // const db = getDb();
  // const userInstalls = await db.select().from(github_installations).where(eq(github_installations.userId, session.user.id));
  
  // For Kareixo v2 demo, we'll fetch all installations or we can fetch a specific one if there's no auth
  // Let's fetch all repositories and recent reviews for the demo to prove it works.
  const db = getDb();
  
  // 1. Fetch Connected Repositories (Joined with installations)
  const repos = await db
    .select({
      repo: repositories,
      install: github_installations,
    })
    .from(repositories)
    .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId));

  // 2. Fetch Recent Activity (Reviews)
  const recentReviews = await db
    .select({
      review: reviews,
      repo: repositories,
    })
    .from(reviews)
    .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  // Compute relative time string
  const getRelativeTime = (date: Date | null) => {
    if (!date) return "Unknown time";
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const daysDifference = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysDifference === 0) {
      const hoursDifference = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60));
      if (hoursDifference === 0) {
        const mins = Math.round((date.getTime() - Date.now()) / (1000 * 60));
        return rtf.format(mins, "minute");
      }
      return rtf.format(hoursDifference, "hour");
    }
    return rtf.format(daysDifference, "day");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12">
        <header className="mb-12">
          <h1 className="text-4xl font-display">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-2">Manage your connected repositories and view recent activity.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Connected Repositories */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Connected Repositories</h2>
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6">
              
              {repos.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <p className="text-[var(--text-secondary)]">No repositories connected yet.</p>
                  <a
                    href="https://github.com/apps/kareixo-reviewer/installations/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-full font-semibold text-sm hover:scale-105 transition-transform"
                  >
                    <FiGithub className="w-4 h-4" />
                    Install App to get started
                  </a>
                </div>
              ) : (
                <div className="space-y-0">
                  {repos.map(({ repo, install }, idx) => (
                    <div key={repo.id} className={`flex items-center justify-between py-4 ${idx !== repos.length - 1 ? 'border-b border-[var(--color-outline)]/10' : ''}`}>
                      <div className="flex items-center gap-4">
                        <FiGithub className="w-6 h-6 text-[var(--text-secondary)]" />
                        <div>
                          <h3 className="font-bold">{repo.fullName}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">Installed via {install.accountLogin}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-mint)]">
                        <FiCheckCircle />
                        Active
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {repos.length > 0 && (
                <div className="py-4 mt-4 text-center border-t border-[var(--color-outline)]/10">
                  <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer" className="text-[var(--color-sky-blue)] hover:underline text-sm font-semibold">
                    + Add or remove repositories on GitHub
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6 space-y-4">
              
              {recentReviews.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[var(--text-secondary)] text-sm">No reviews yet.</p>
                </div>
              ) : (
                recentReviews.map(({ review, repo }) => (
                  <div key={review.id} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${review.status === 'failed' ? 'bg-[var(--color-coral)]/20' : 'bg-[var(--color-sky-blue)]/20'}`}>
                      {review.status === 'failed' ? (
                        <FiXCircle className="text-[var(--color-coral)]" />
                      ) : (
                        <FiActivity className="text-[var(--color-sky-blue)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">
                        Reviewed <span className="font-semibold">PR #{review.prNumber}</span> on <span className="font-semibold">{repo.fullName.split('/')[1]}</span>
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{getRelativeTime(review.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
