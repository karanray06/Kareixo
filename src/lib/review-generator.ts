import { getDb } from "@/db";
import { generateObject } from "ai";
import { router } from "./model-router";
import { getInstallationOctokit } from "./github-app";
import { repositories, reviews, github_installations, users } from "@/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { z } from "zod";
import { executeSandbox, formatSandboxContext } from "./sandbox-executor";
import {
  createPipelineRun,
  emitPipelineStep,
  setAISummary,
} from "./pipeline-events";

const ReviewOutputSchema = z.object({
  findings: z.array(
    z.object({
      path: z.string().describe("The file path of the finding."),
      line: z.number().describe("The line number in the patched file."),
      severity: z.string().describe("High, Medium, or Low."),
      category: z.string().describe("Logic, Security, Performance, or Style."),
      comment: z.string().describe("The actual review comment text to post."),
    })
  ),
  summary: z.string().describe("A high-level summary of the review."),
});

/**
 * Queue and execute a code review for a PR.
 * Called from the webhook handler via waitUntil() — runs async after the 200 is sent.
 */
export async function queueReview(installationId: number, repoFullName: string, prNumber: number) {
  const db = getDb();
  const logPrefix = `[Review ${repoFullName}#${prNumber}]`;
  console.log(`${logPrefix} ── PIPELINE START ──`);

  let pendingReviewId: string | null = null;
  let octokit: Awaited<ReturnType<typeof getInstallationOctokit>> | null = null;
  const [owner, repo] = repoFullName.split("/");

  try {
    // ── Step 1: Get installation Octokit ──
    console.log(`${logPrefix} Step 1: Authenticating as GitHub App installation ${installationId}`);
    octokit = await getInstallationOctokit(installationId);
    console.log(`${logPrefix} Step 1: ✅ Authenticated`);

    // ── Step 2: Find repository in DB ──
    console.log(`${logPrefix} Step 2: Looking up repository in DB`);
    const [repository] = await db.select().from(repositories).where(
      and(
        eq(repositories.installationId, installationId),
        eq(repositories.fullName, repoFullName)
      )
    );

    if (!repository) {
      console.warn(`${logPrefix} Step 2: ❌ Repository not found in DB — skipping`);
      if (octokit) {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: `⚠️ **Kareixo Configuration Error**\n\nThis repository is not registered in Kareixo's database. This usually happens if a database migration was recently run. Please go to your GitHub Settings, **uninstall the Kareixo app, and reinstall it** to sync the repository back to the database.`,
        }).catch(() => {});
      }
      return;
    }
    console.log(`${logPrefix} Step 2: ✅ Found repository (id=${repository.id})`);

    // ── Step 3: Create pending review record ──
    console.log(`${logPrefix} Step 3: Creating pending review record`);
    const [pendingReview] = await db.insert(reviews).values({
      repositoryId: repository.id,
      prNumber,
      status: "pending",
    }).returning({ id: reviews.id });
    
    pendingReviewId = pendingReview.id;
    console.log(`${logPrefix} Step 3: ✅ Review record created (id=${pendingReviewId})`);

    // ── Initialize pipeline tracking ──
    createPipelineRun(pendingReviewId, repoFullName, prNumber);
    emitPipelineStep(pendingReviewId, "authenticating", "complete", `Installation ${installationId}`);

    // ── Step 4: Enforce monetization cap ──
    console.log(`${logPrefix} Step 4: Checking monetization cap`);
    emitPipelineStep(pendingReviewId, "checking_cap", "active", "Checking usage limits...");

    const [installRecord] = await db.select({
      user: users
    })
    .from(github_installations)
    .innerJoin(users, eq(github_installations.userId, users.id))
    .where(eq(github_installations.installationId, installationId));

    if (installRecord?.user.plan === "free") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usageResult = await db.select({ count: sql<number>`count(*)` })
        .from(reviews)
        .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
        .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
        .where(
          and(
            eq(github_installations.userId, installRecord.user.id),
            gte(reviews.createdAt, startOfMonth)
          )
        );
      
      const count = Number(usageResult[0]?.count || 0);
      if (count >= 50) {
        console.warn(`${logPrefix} Step 4: ❌ Free tier limit reached (${count}/50)`);
        emitPipelineStep(pendingReviewId, "failed", "failed", `Free tier limit reached (${count}/50)`);
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: "Kareixo has reached the monthly free-tier limit (50 reviews) for this account. Please upgrade to Pro or Team to continue receiving automatic reviews."
        });
        
        await db.update(reviews)
          .set({ status: "failed", summary: "Free tier limit reached" })
          .where(eq(reviews.id, pendingReviewId));
        return;
      }
      console.log(`${logPrefix} Step 4: ✅ Free tier usage: ${count}/50`);
    } else {
      console.log(`${logPrefix} Step 4: ✅ Plan: ${installRecord?.user.plan ?? "unknown"} — no cap`);
    }

    emitPipelineStep(pendingReviewId, "checking_cap", "complete", "Usage OK");

    // ── Step 5: Fetch PR diff ──
    console.log(`${logPrefix} Step 5: Fetching PR data and diff`);
    emitPipelineStep(pendingReviewId, "fetching_pr", "active", "Fetching PR diff...");

    const { data: prData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    const headSha = prData.head.sha;
    const prBranch = prData.head.ref;
    console.log(`${logPrefix} Step 5: PR head SHA: ${headSha}, branch: ${prBranch}`);

    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: "diff" },
    });

    const diffString = typeof diff === "string" ? diff : JSON.stringify(diff);
    
    // Guard against massive diffs
    const MAX_DIFF_LENGTH = 15000;
    const isTruncated = diffString.length > MAX_DIFF_LENGTH;
    const diffContext = isTruncated ? diffString.slice(0, MAX_DIFF_LENGTH) + "\n... (diff truncated)" : diffString;
    console.log(`${logPrefix} Step 5: ✅ Diff fetched (${diffString.length} chars${isTruncated ? ", truncated" : ""})`);

    emitPipelineStep(pendingReviewId, "fetching_pr", "complete", `Diff: ${diffString.length} chars`);

    // ── Step 5.5: E2B Sandbox Execution (deep tier only) ──
    const tier = (repository.preferredTier === "deep") ? "deep" : "fast";
    let sandboxContext = "";

    if (tier === "deep" && process.env.E2B_API_KEY) {
      console.log(`${logPrefix} Step 5.5: Running E2B sandbox (deep tier)`);

      const sandboxResult = await executeSandbox({
        owner,
        repo,
        branch: prBranch,
        installationId,
        reviewId: pendingReviewId,
      });

      if (sandboxResult) {
        sandboxContext = formatSandboxContext(sandboxResult);
        console.log(
          `${logPrefix} Step 5.5: ✅ Sandbox complete ` +
          `(success=${sandboxResult.success}, exit=${sandboxResult.exitCode}, ${sandboxResult.durationMs}ms)`
        );
      } else {
        console.log(`${logPrefix} Step 5.5: Sandbox skipped or unavailable`);
      }
    } else {
      const skipReason = !process.env.E2B_API_KEY ? "No E2B_API_KEY" : "Fast tier";
      console.log(`${logPrefix} Step 5.5: Skipping sandbox (${skipReason})`);
      emitPipelineStep(pendingReviewId, "sandbox_skipped", "skipped", skipReason);
    }

    // ── Step 6: Generate AI review ──
    let categories: string[];
    try {
      categories = JSON.parse(repository.enabledCategories);
    } catch {
      categories = ["logic", "security", "style"];
    }
    
    let systemPrompt = `You are Kareixo, an expert code reviewer. Analyze the following pull request diff. Identify logic errors, security flaws, performance issues, and code style improvements. Return structured JSON with your findings. Ensure line numbers match the diff correctly.\n\nOnly flag issues in these categories: ${categories.join(", ")}.`;
    
    if (repository.customInstructions) {
      systemPrompt += `\n\nAdditional Team Rules:\n${repository.customInstructions}`;
    }

    // Append sandbox results to the prompt if available
    if (sandboxContext) {
      systemPrompt += `\n\nIMPORTANT: The PR code was executed in a sandboxed environment. Review the test execution results below and incorporate them into your analysis. If tests failed, identify the root cause from the error output and suggest specific fixes.`;
    }
    
    console.log(`${logPrefix} Step 6: Generating AI review (tier=${tier}, categories=${categories.join(",")})`);
    emitPipelineStep(pendingReviewId, "llm_routing", "active", `Routing to ${tier} tier model...`);

    const { result, provider } = await router.executeWithFailover(async (provider) => {
      // Emit which provider we're trying
      emitPipelineStep(
        pendingReviewId!,
        "llm_routing",
        "active",
        `Analyzing with ${provider.modelName}...`,
        { provider: provider.name }
      );

      const prompt = sandboxContext
        ? `Diff:\n${diffContext}\n${sandboxContext}`
        : `Diff:\n${diffContext}`;

      const response = await generateObject({
        model: provider.model,
        system: systemPrompt,
        prompt,
        schema: ReviewOutputSchema,
      });
      return response.object;
    }, "chat", tier);
    
    console.log(
      `${logPrefix} Step 6: ✅ Review generated via ${provider.name} (${provider.modelName}, key for ${provider.keyState.task}). ` +
      `Findings: ${result.findings.length}`
    );

    emitPipelineStep(
      pendingReviewId,
      "llm_complete",
      "complete",
      `${result.findings.length} findings via ${provider.modelName}`,
      { provider: provider.name }
    );
    setAISummary(pendingReviewId, result.summary, provider.name);

    // ── Step 7: Post review to GitHub ──
    console.log(`${logPrefix} Step 7: Posting review to GitHub`);
    emitPipelineStep(pendingReviewId, "posting_review", "active", "Posting to GitHub...");

    const comments = result.findings.map(f => ({
      path: f.path,
      line: f.line,
      body: `**[${f.severity} / ${f.category}]** ${f.comment}`,
    }));

    let finalSummary = result.summary;
    if (isTruncated) {
      finalSummary += "\n\n_Note: This PR was very large. Some files may have been skipped to stay within review limits._";
    }

    // Add sandbox badge to the summary if sandbox was used
    if (sandboxContext) {
      const sandboxBadge = "🧪 **Sandbox Verified** — This PR was tested in an E2B microVM before review.";
      finalSummary = `${sandboxBadge}\n\n${finalSummary}`;
    }

    try {
      const reviewResponse = await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        event: "COMMENT",
        body: finalSummary,
        comments: comments.length > 0 ? comments : undefined,
      });
      console.log(`${logPrefix} Step 7: ✅ Inline review posted (status=${reviewResponse.status})`);
    } catch (postError: any) {
      console.warn(
        `${logPrefix} Step 7: ⚠️ Inline review failed (status=${postError?.status}, ` +
        `message=${postError?.message}). Falling back to issue comment.`
      );
      if (postError?.response?.data) {
        console.warn(`${logPrefix} Step 7: GitHub API error body:`, JSON.stringify(postError.response.data));
      }
      
      // Fallback: Post as a single issue comment
      const fallbackBody = `${finalSummary}\n\n**Findings:**\n` + 
        result.findings.map(f => `- **${f.path}:${f.line}** [${f.severity} / ${f.category}]: ${f.comment}`).join("\n");
        
      const fallbackResponse = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: fallbackBody,
      });
      console.log(`${logPrefix} Step 7: ✅ Fallback comment posted (status=${fallbackResponse.status})`);
    }

    emitPipelineStep(pendingReviewId, "posting_review", "complete", "Review posted");

    // ── Step 8: Create check run ──
    console.log(`${logPrefix} Step 8: Creating check run`);
    emitPipelineStep(pendingReviewId, "creating_check", "active", "Creating GitHub check run...");

    const hasHighSeverity = result.findings.some(f => f.severity.toLowerCase() === 'high');

    const checkResponse = await octokit.rest.checks.create({
      owner,
      repo,
      name: "Kareixo Code Review",
      head_sha: headSha,
      status: "completed",
      conclusion: hasHighSeverity ? "failure" : "success",
      output: {
        title: hasHighSeverity ? "High-severity issues found" : "Review passed",
        summary: finalSummary,
      }
    });
    console.log(`${logPrefix} Step 8: ✅ Check run created (status=${checkResponse.status})`);

    emitPipelineStep(pendingReviewId, "creating_check", "complete", "Check run created");

    // ── Step 9: Update DB record ──
    await db.update(reviews)
      .set({
        status: "completed",
        summary: result.summary,
        findingCount: result.findings.length,
      })
      .where(eq(reviews.id, pendingReviewId));

    emitPipelineStep(pendingReviewId, "complete", "complete", `${result.findings.length} findings`);
    console.log(`${logPrefix} ── PIPELINE COMPLETE ── (${result.findings.length} findings)`);
    
  } catch (error: any) {
    console.error(`${logPrefix} ── PIPELINE FAILED ──`, error);

    // Emit failure to pipeline
    if (pendingReviewId) {
      emitPipelineStep(pendingReviewId, "failed", "failed", error?.message?.slice(0, 200));
    }

    // Update DB record to failed
    if (pendingReviewId) {
      await db.update(reviews)
        .set({ status: "failed", summary: error?.message?.slice(0, 500) })
        .where(eq(reviews.id, pendingReviewId)).catch(() => {});
    }

    // ── Dead-letter fallback: post a minimal comment so it's never silent ──
    if (octokit) {
      try {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: `⚠️ **Kareixo** couldn't complete a review on this PR.\n\n` +
            `**Error:** ${error?.message?.slice(0, 300) || "Unknown error"}\n\n` +
            `_The team has been notified. A review will be retried on the next push._`,
        });
        console.log(`${logPrefix} Dead-letter fallback comment posted.`);
      } catch (deadLetterError) {
        console.error(`${logPrefix} Dead-letter fallback ALSO failed:`, deadLetterError);
      }
    }
  }
}
