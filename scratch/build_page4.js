const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "../src/app/dashboard/page.tsx");
const content = fs.readFileSync(pagePath, "utf-8");
const lines = content.split('\n');

// Find start and end by searching for specific lines
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3"') && startIdx === -1) {
    startIdx = i;
  }
  if (lines[i].includes('<span>Showing 5 of 48 total reviews</span>')) {
    endIdx = i - 2; // the blank line before the "Showing X reviews" div
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  console.log(`Replacing lines ${startIdx} to ${endIdx}`);
  
  const before = lines.slice(0, startIdx).join('\n');
  const after = lines.slice(endIdx).join('\n');
  
  const newReviewsBlock = `
  {(!data?.recentReviews || data.recentReviews.length === 0) ? (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-surface-subtle">
      <span className="material-symbols-outlined text-[32px] text-text-muted mb-3">inbox</span>
      <h3 className="font-title-card-sm text-text-primary">No reviews yet</h3>
      <p className="font-body-sm text-text-secondary mt-1">When PRs are opened in your connected repositories, reviews will appear here.</p>
    </div>
  ) : data.recentReviews.map((review: any) => (
    <div key={review.id} className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">
            {data.repositories?.find((r: any) => r.id === review.repositoryId)?.fullName || "repository"}
          </span>
          <span className="font-badge-mono text-badge-mono text-text-secondary font-medium">#{review.pullRequestNumber}</span>
          <span className="font-title-card-sm text-title-card-sm text-text-primary hover:text-secondary cursor-pointer transition-colors">
            {review.pullRequestTitle || "Pull Request Review"}
          </span>
        </div>
        <span className={\`self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium \${review.findingCount > 0 ? "bg-warning-subtle text-warning border border-warning/30" : "bg-success-subtle text-success border border-success/30"}\`}>
          <span className={\`w-1.5 h-1.5 rounded-full \${review.findingCount > 0 ? "bg-warning" : "bg-success"}\`}></span>
          {review.findingCount > 0 ? "Needs attention" : "Passed clean"}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary">
        <div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
          <span className="flex items-center gap-1 text-text-secondary">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
          {review.findingCount > 0 ? (
            <>
              <span className="text-text-muted">·</span>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-warning-subtle text-warning font-medium text-[11px]">
                  {review.findingCount} Findings
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">0 findings flagged</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <a className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors" href={review.pullRequestUrl || "#"} target="_blank" rel="noopener noreferrer" title="Open in GitHub">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </a>
          <a href={\`/dashboard/\${review.repositoryId}\`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui border border-border transition-colors">
            <span>View Details</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  ))}
  `;

  fs.writeFileSync(pagePath, before + '\\n' + newReviewsBlock + '\\n' + after);
  console.log("Success");
} else {
  console.log("Indexes not found");
}
