"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RepoData {
  id: string;
  fullName: string;
  enabledCategories: string[];
  preferredTier: string;
  createdAt: string;
}

interface ReviewData {
  id: string;
  repositoryId: string;
  prNumber: number;
  status: string;
  summary: string | null;
  findingCount: number;
  createdAt: string;
}

interface DashboardData {
  repositories: RepoData[];
  stats: {
    totalReviews: number;
    passedClean: number;
    activeFindings: number;
  };
  recentReviews: ReviewData[];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStatusBadge(review: ReviewData) {
  if (review.status === "failed") {
    return (
      <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-error-subtle text-error border border-error/30">
        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
        Failed
      </span>
    );
  }
  if (review.findingCount === 0) {
    return (
      <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-success-subtle text-success border border-success/30">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        Passed clean
      </span>
    );
  }
  if (review.findingCount > 3) {
    return (
      <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-warning-subtle text-warning border border-warning/30">
        <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
        Needs attention
      </span>
    );
  }
  return (
    <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-accent-ai-subtle text-secondary border border-secondary/30">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
      Passed with suggestions
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-surface-container rounded"></div>
        <div className="h-4 w-4 bg-surface-container rounded-full"></div>
      </div>
      <div className="h-8 w-16 bg-surface-container rounded"></div>
      <div className="h-2 w-full bg-surface-container rounded"></div>
    </div>
  );
}

function SkeletonReview() {
  return (
    <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-surface-container rounded"></div>
        <div className="h-4 w-12 bg-surface-container rounded"></div>
        <div className="h-4 w-40 bg-surface-container rounded"></div>
      </div>
      <div className="h-3 w-32 bg-surface-container rounded"></div>
    </div>
  );
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/repositories")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/repositories/sync", { method: "POST" });
      fetchData();
    } finally {
      setSyncing(false);
    }
  };

  const userName = session?.user?.name?.split(" ")[0] || "User";
  const repoCount = data?.repositories?.length || 0;
  const totalReviews = data?.stats?.totalReviews || 0;
  const passedClean = data?.stats?.passedClean || 0;
  const passRate = totalReviews > 0 ? Math.round((passedClean / totalReviews) * 100) : 0;
  const activeFindings = data?.stats?.activeFindings || 0;

  // Determine time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Empty state for brand-new users
  if (!loading && repoCount === 0) {
    return (
      <>
        <div className="flex flex-col w-full">
          <div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-8">
            <div className="flex flex-col gap-1 pb-space-4 border-b border-border">
              <div className="flex items-center gap-2 font-badge-mono text-badge-mono text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-text-muted"></span>
                <span>NO REPOSITORIES CONNECTED</span>
              </div>
              <h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
                {greeting}, {userName}.
              </h1>
              <p className="font-body-base text-body-base text-text-secondary">
                Connect your first repository to start getting automated code reviews.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center">
                <span className="material-symbols-outlined text-[40px] text-text-muted">
                  add_circle
                </span>
              </div>
              <div className="text-center max-w-md">
                <h2 className="font-title-card text-title-card text-text-primary mb-2">
                  Connect your first repository
                </h2>
                <p className="font-body-base text-body-base text-text-secondary mb-6">
                  Install the Kareixo GitHub App on your repositories to enable automatic pull
                  request reviews with AI-powered code analysis.
                </p>
                <a
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Install on GitHub</span>
                </a>
              </div>
              <button
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-border-strong text-text-primary font-label-ui text-label-ui shadow-sm transition-all hover:bg-surface-subtle active:scale-95 mt-2"
                onClick={handleSync}
                disabled={syncing}
              >
                <span
                  className={`material-symbols-outlined text-[16px] text-text-secondary ${syncing ? "animate-spin" : ""}`}
                >
                  sync
                </span>
                <span>{syncing ? "Syncing..." : "Already installed? Sync"}</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-4 pb-space-4 border-b border-border">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-badge-mono text-badge-mono text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span>SYSTEM DISPATCHER ACTIVE</span>
                <span className="text-text-muted">/</span>
                <span>
                  {loading ? "..." : repoCount} REPOSITORIES MONITORED
                </span>
              </div>
              <h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
                {greeting}, {userName}.
              </h1>
              <p className="font-body-base text-body-base text-text-secondary">
                Here&apos;s what&apos;s happening across your{" "}
                {loading ? "..." : repoCount} connected repositories.
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-space-3">
              <button
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-border-strong text-text-primary font-label-ui text-label-ui shadow-sm transition-all hover:bg-surface-subtle active:scale-95"
                onClick={handleSync}
                disabled={syncing}
              >
                <span
                  className={`material-symbols-outlined text-[16px] text-text-secondary ${syncing ? "animate-spin" : ""}`}
                >
                  sync
                </span>
                <span>{syncing ? "Syncing..." : "Sync Repositories"}</span>
              </button>

              <a
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui shadow-sm hover:opacity-90 active:scale-95 transition-all"
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Repository</span>
              </a>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* Total Reviews */}
                <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">
                      Total Reviews
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-text-muted">
                      rate_review
                    </span>
                  </div>
                  <div className="my-space-3 flex items-baseline justify-between">
                    <span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">
                      {totalReviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px] pt-2 border-t border-border/60">
                    <span>Across {repoCount} repositories</span>
                  </div>
                </div>

                {/* Passed Clean */}
                <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">
                      Passed Clean
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  </div>
                  <div className="my-space-3 flex items-baseline justify-between">
                    <span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">
                      {passedClean}
                    </span>
                    <span className="font-badge-mono text-badge-mono text-text-secondary">
                      {passRate}% pass rate
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full transition-all duration-500"
                      style={{ width: `${passRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Active Findings */}
                <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">
                      Active Findings
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
                  </div>
                  <div className="my-space-3 flex items-baseline justify-between">
                    <span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">
                      {activeFindings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px] pt-2 border-t border-border/60">
                    <span>Across recent reviews</span>
                    {activeFindings > 0 && (
                      <span className="text-warning font-medium">Needs review</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-8 items-start">
            {/* Recent Reviews */}
            <div className="lg:col-span-8 flex flex-col gap-space-4">
              <div className="flex items-center justify-between bg-surface px-space-4 py-space-3 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-space-3">
                  <h2 className="font-title-card-sm text-title-card-sm text-text-primary">
                    Recent Automated Reviews
                  </h2>
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-ai-subtle border border-outline-variant/40 font-badge-mono text-[11px] text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                    <span>Connected to GitHub Events</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-3">
                {loading ? (
                  <>
                    <SkeletonReview />
                    <SkeletonReview />
                    <SkeletonReview />
                  </>
                ) : data?.recentReviews && data.recentReviews.length > 0 ? (
                  data.recentReviews.map((review) => {
                    const repo = data.repositories.find(
                      (r) => r.id === review.repositoryId
                    );
                    const repoName = repo?.fullName?.split("/")[1] || "repo";
                    return (
                      <div
                        key={review.id}
                        className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">
                              {repoName}
                            </span>
                            <span className="font-badge-mono text-badge-mono text-text-secondary font-medium">
                              #{review.prNumber}
                            </span>
                            <span className="font-title-card-sm text-title-card-sm text-text-primary">
                              {review.summary || "Pull request review"}
                            </span>
                          </div>
                          {getStatusBadge(review)}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary">
                          <div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
                            <span className="flex items-center gap-1 text-text-secondary">
                              <span className="material-symbols-outlined text-[14px]">
                                schedule
                              </span>
                              {timeAgo(review.createdAt)}
                            </span>
                            <span className="text-text-muted">·</span>
                            <span className="text-text-muted">
                              {review.findingCount} finding
                              {review.findingCount !== 1 ? "s" : ""} flagged
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <Link
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui border border-border transition-colors"
                              href={`/dashboard/${review.repositoryId}`}
                            >
                              <span>View Details</span>
                              <span className="material-symbols-outlined text-[14px]">
                                arrow_forward
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-surface rounded-xl border border-border p-space-8 flex flex-col items-center justify-center gap-3 text-center">
                    <span className="material-symbols-outlined text-[32px] text-text-muted">
                      rate_review
                    </span>
                    <p className="font-body-base text-body-base text-text-secondary">
                      No reviews yet. Open a pull request on a connected repository to trigger your
                      first automated review.
                    </p>
                  </div>
                )}

                {!loading && totalReviews > 5 && (
                  <div className="flex items-center justify-between px-space-2 py-2 text-text-secondary font-badge-mono text-[12px]">
                    <span>
                      Showing {Math.min(5, data?.recentReviews?.length || 0)} of {totalReviews}{" "}
                      total reviews
                    </span>
                    <Link
                      href="/dashboard/reviews"
                      className="hover:text-text-primary underline underline-offset-4 transition-colors"
                    >
                      View all reviews →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-space-4">
              {/* Repository Health */}
              <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-space-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-space-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-text-secondary">
                      lan
                    </span>
                    <h3 className="font-title-card-sm text-title-card-sm text-text-primary">
                      Repository Health
                    </h3>
                  </div>
                  <span className="font-badge-mono text-[11px] text-text-muted">Real-time</span>
                </div>
                <div className="flex flex-col gap-space-3">
                  {loading ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                      <div className="h-12 bg-surface-container rounded-lg"></div>
                      <div className="h-12 bg-surface-container rounded-lg"></div>
                    </div>
                  ) : data?.repositories && data.repositories.length > 0 ? (
                    data.repositories.slice(0, 4).map((repo) => (
                      <Link
                        key={repo.id}
                        href={`/dashboard/${repo.id}`}
                        className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface-subtle transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-badge-mono text-badge-mono font-medium text-text-primary truncate">
                            {repo.fullName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-badge-mono text-text-muted">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              fork_right
                            </span>
                            main
                          </span>
                          <span>{timeAgo(repo.createdAt)}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-text-muted font-badge-mono text-[12px] py-2">
                      No repositories connected.
                    </p>
                  )}
                </div>
                {!loading && repoCount > 4 && (
                  <Link
                    className="pt-space-2 text-center font-label-ui text-label-ui text-text-secondary hover:text-text-primary border-t border-border flex items-center justify-center gap-1.5 transition-colors"
                    href="/dashboard/repositories"
                  >
                    <span>View all {repoCount} repositories</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                )}
              </div>

              {/* Engine & Routing — static system info, fine to keep as-is */}
              <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-space-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      memory
                    </span>
                    <h3 className="font-title-card-sm text-title-card-sm text-text-primary">
                      Engine &amp; Routing
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-badge-mono text-[10px] font-medium bg-success-subtle text-success border border-success/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    Operational
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2 font-badge-mono text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Primary Route</span>
                    <span className="text-text-primary font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      Gemini Pro
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Failover</span>
                    <span className="text-text-secondary">Pollinations (Standby)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Cluster Region</span>
                    <span className="text-text-primary">us-east (Virginia)</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                    <span className="text-text-muted">Data Retention</span>
                    <span className="text-success font-semibold">Zero code stored</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Strict ephemeral context
                  </span>
                  <span>v1.4.2-rev</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
