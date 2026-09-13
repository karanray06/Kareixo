/**
 * GitHub Writer — creates branches, commits file changes, and opens PRs.
 * Reusable by CodeChat's proposeChange and future Incident Tracer "propose fix".
 *
 * Requires the GitHub App to have `contents: write` and `pull_requests: write` permissions.
 * Handles 403 gracefully with a clear "re-approve permissions" message.
 */

import { Octokit } from "octokit";

export interface CreateBranchAndPROptions {
  octokit: Octokit;
  owner: string;
  repo: string;
  path: string;
  content: string;
  baseSha: string;
  message: string;
  explanation: string;
  defaultBranch?: string;
}

export interface PRResult {
  prUrl: string;
  prNumber: number;
  branchName: string;
}

/**
 * Create a new branch from the default branch, commit a file change, and open a PR.
 */
export async function createBranchAndPR({
  octokit,
  owner,
  repo,
  path,
  content,
  baseSha,
  message,
  explanation,
  defaultBranch = "main",
}: CreateBranchAndPROptions): Promise<PRResult> {
  const timestamp = Date.now();
  const branchName = `kareixo/codechat-${timestamp}`;

  try {
    // 1. Get the latest commit SHA on the default branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const baseCommitSha = refData.object.sha;

    // 2. Create the new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseCommitSha,
    });

    // 3. Create or update the file on the new branch
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      sha: baseSha,
      branch: branchName,
    });

    // 4. Open a PR
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `[Kareixo CodeChat] ${message}`,
      head: branchName,
      base: defaultBranch,
      body: `## CodeChat Proposed Change\n\n${explanation}\n\n---\n\n*This PR was created by Kareixo CodeChat.*`,
    });

    return {
      prUrl: pr.html_url,
      prNumber: pr.number,
      branchName,
    };
  } catch (err: any) {
    // Handle permission errors gracefully
    if (err?.status === 403) {
      throw new Error(
        "The Kareixo GitHub App doesn't have write permissions for this repository. " +
        "Please go to your GitHub App settings and re-approve with 'Contents: Write' and 'Pull Requests: Write' permissions."
      );
    }
    if (err?.status === 422 && err?.message?.includes("Reference already exists")) {
      throw new Error(
        `Branch '${branchName}' already exists. Please try again.`
      );
    }
    throw err;
  }
}

/**
 * Get the default branch name for a repository.
 */
export async function getDefaultBranch(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string> {
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data.default_branch;
}
