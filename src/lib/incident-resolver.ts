/**
 * Incident Resolver — correlates stack trace frames to PRs and reviews.
 * 
 * For each file/line in a parsed stack trace:
 * 1. Gets the most recent commit touching that line (via GitHub API)
 * 2. Resolves that commit to its PR
 * 3. Pulls the PR's diff and any Kareixo review comments
 * 4. Assembles a context bundle for CodeChat handoff
 */

import { getInstallationOctokit } from "./github-app";
import { StackFrame } from "./trace-parser";

export type CommitInfo = {
  sha: string;
  message: string;
  author: string;
  date: string;
};

export type PRInfo = {
  number: number;
  title: string;
  url: string;
  state: string;
  diff?: string;
  reviewComments?: Array<{
    body: string;
    path: string;
    line: number;
  }>;
};

export type ResolvedFrame = {
  frame: StackFrame;
  commit?: CommitInfo;
  pr?: PRInfo;
  error?: string;
};

export type IncidentContext = {
  stackTrace: string;
  resolvedFrames: ResolvedFrame[];
  summary: string;
  relatedPRs: PRInfo[];
};

/**
 * Resolve a stack trace against a GitHub repository.
 * Returns enriched context for CodeChat handoff.
 */
export async function resolveIncident(
  installationId: number,
  repoFullName: string,
  frames: StackFrame[],
  stackTrace: string,
  branch = "main"
): Promise<IncidentContext> {
  const [owner, repo] = repoFullName.split("/");
  const octokit = await getInstallationOctokit(installationId);
  
  const resolvedFrames: ResolvedFrame[] = [];
  const seenPRNumbers = new Set<number>();
  const relatedPRs: PRInfo[] = [];

  // Process top 5 frames (most relevant, avoids API rate limits)
  const framesToProcess = frames.slice(0, 5);

  for (const frame of framesToProcess) {
    const resolved: ResolvedFrame = { frame };

    try {
      // 1. Get commits touching this file
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        path: frame.filePath,
        sha: branch,
        per_page: 5,
      });

      if (commits.length > 0) {
        const latestCommit = commits[0];
        resolved.commit = {
          sha: latestCommit.sha,
          message: latestCommit.commit.message,
          author: latestCommit.commit.author?.name || "unknown",
          date: latestCommit.commit.author?.date || "",
        };

        // 2. Find PRs associated with this commit
        try {
          const { data: prs } = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
            owner,
            repo,
            commit_sha: latestCommit.sha,
          });

          if (prs.length > 0) {
            const pr = prs[0];
            if (!seenPRNumbers.has(pr.number)) {
              seenPRNumbers.add(pr.number);

              const prInfo: PRInfo = {
                number: pr.number,
                title: pr.title,
                url: pr.html_url,
                state: pr.state,
              };

              // 3. Get PR diff (truncated for context limits)
              try {
                const { data: diff } = await octokit.rest.pulls.get({
                  owner,
                  repo,
                  pull_number: pr.number,
                  mediaType: { format: "diff" },
                });
                const diffStr = typeof diff === "string" ? diff : JSON.stringify(diff);
                prInfo.diff = diffStr.length > 8000 ? diffStr.slice(0, 8000) + "\n... [truncated]" : diffStr;
              } catch {
                // Diff fetch failed — non-fatal
              }

              // 4. Get review comments on this PR
              try {
                const { data: reviewComments } = await octokit.rest.pulls.listReviewComments({
                  owner,
                  repo,
                  pull_number: pr.number,
                  per_page: 20,
                });

                prInfo.reviewComments = reviewComments
                  .filter((c: any) => c.user?.login?.includes("kareixo") || c.body?.includes("[High") || c.body?.includes("[Medium"))
                  .map((c: any) => ({
                    body: c.body,
                    path: c.path,
                    line: c.line || c.original_line || 0,
                  }));
              } catch {
                // Review comments fetch failed — non-fatal
              }

              relatedPRs.push(prInfo);
              resolved.pr = prInfo;
            }
          }
        } catch {
          // PR lookup failed — non-fatal
        }
      }
    } catch (err: any) {
      resolved.error = err?.message || "Failed to resolve frame";
    }

    resolvedFrames.push(resolved);
  }

  // Build summary
  const prSummary = relatedPRs.length > 0
    ? `Traced to ${relatedPRs.length} PR(s): ${relatedPRs.map(p => `#${p.number} "${p.title}"`).join(", ")}`
    : "No PRs could be correlated with this stack trace.";

  const summary = `Incident Analysis for ${repoFullName}:\n\n` +
    `Stack trace has ${frames.length} project-relevant frame(s).\n` +
    `${prSummary}\n\n` +
    `Top frames analyzed:\n` +
    resolvedFrames.map(rf => {
      let line = `  • ${rf.frame.filePath}:${rf.frame.lineNumber}`;
      if (rf.commit) line += ` — last touched by "${rf.commit.message.split("\n")[0]}" (${rf.commit.sha.slice(0, 7)})`;
      if (rf.pr) line += ` → PR #${rf.pr.number}`;
      if (rf.error) line += ` [error: ${rf.error}]`;
      return line;
    }).join("\n");

  return {
    stackTrace,
    resolvedFrames,
    summary,
    relatedPRs,
  };
}
