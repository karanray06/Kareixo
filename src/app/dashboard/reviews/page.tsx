"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Review {
  id: string;
  repositoryId: string;
  prNumber: number;
  status: string;
  summary: string | null;
  findingCount: number;
  createdAt: string;
  repoFullName: string;
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

function getStatusBadge(review: Review) {
  if (review.status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-error-subtle text-error border border-error/30">
        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
        Failed
      </span>
    );
  }
  if (review.findingCount === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-success-subtle text-success border border-success/30">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        Passed clean
      </span>
    );
  }
  if (review.findingCount > 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-warning-subtle text-warning border border-warning/30">
        <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
        Needs attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-accent-ai-subtle text-secondary border border-secondary/30">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
      Has suggestions
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "clean" | "findings" | "failed">("all");

  useEffect(() => {
    fetch("/api/reviews?limit=50")
      .then((res) => res.json())
      .then((json) => {
        setReviews(json.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "clean") return r.findingCount === 0 && r.status !== "failed";
    if (filter === "findings") return r.findingCount > 0 && r.status !== "failed";
    if (filter === "failed") return r.status === "failed";
    return true;
  });

  const countClean = reviews.filter((r) => r.findingCount === 0 && r.status !== "failed").length;
  const countFindings = reviews.filter((r) => r.findingCount > 0 && r.status !== "failed").length;
  const countFailed = reviews.filter((r) => r.status === "failed").length;

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-4 pb-space-4 border-b border-border">
          <div>
            <h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
              Reviews
            </h1>
            <p className="font-body-base text-body-base text-text-secondary mt-1">
              {loading
                ? "Loading..."
                : `${reviews.length} automated reviews across all repositories`}
            </p>
          </div>

          {/* Filter tabs */}
          {!loading && reviews.length > 0 && (
            <div className="flex items-center bg-surface-subtle p-0.5 rounded-lg border border-border self-start">
              <button
                className={`px-2.5 py-1 rounded-md font-label-ui text-[12px] transition-colors ${filter === "all" ? "bg-surface text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"}`}
                onClick={() => setFilter("all")}
              >
                All ({reviews.length})
              </button>
              <button
                className={`px-2.5 py-1 rounded-md font-label-ui text-[12px] transition-colors ${filter === "clean" ? "bg-surface text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"}`}
                onClick={() => setFilter("clean")}
              >
                Clean ({countClean})
              </button>
              <button
                className={`px-2.5 py-1 rounded-md font-label-ui text-[12px] transition-colors ${filter === "findings" ? "bg-surface text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"}`}
                onClick={() => setFilter("findings")}
              >
                Findings ({countFindings})
              </button>
              <button
                className={`px-2.5 py-1 rounded-md font-label-ui text-[12px] transition-colors ${filter === "failed" ? "bg-surface text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"}`}
                onClick={() => setFilter("failed")}
              >
                Failed ({countFailed})
              </button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex flex-col gap-space-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-surface-container rounded"></div>
                  <div className="h-4 w-12 bg-surface-container rounded"></div>
                  <div className="h-4 w-40 bg-surface-container rounded"></div>
                </div>
                <div className="h-3 w-32 bg-surface-container rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-text-muted">
                rate_review
              </span>
            </div>
            <div className="text-center max-w-md">
              <h2 className="font-title-card text-title-card text-text-primary mb-2">
                {filter === "all" ? "No reviews yet" : `No ${filter} reviews`}
              </h2>
              <p className="font-body-base text-body-base text-text-secondary">
                {filter === "all"
                  ? "Open a pull request on a connected repository to trigger your first automated review."
                  : "Try adjusting the filter to see other reviews."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-space-3">
            {filteredReviews.map((review) => {
              const repoName = review.repoFullName?.split("/")[1] || "repo";
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
                      <span className="text-text-muted">{review.repoFullName}</span>
                      <span className="text-text-muted">·</span>
                      <span className="flex items-center gap-1 text-text-secondary">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {timeAgo(review.createdAt)}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-muted">
                        {review.findingCount} finding{review.findingCount !== 1 ? "s" : ""}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
