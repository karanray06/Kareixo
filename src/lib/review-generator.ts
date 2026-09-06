import { getDb } from "@/db";
import { generateObject } from "ai";
import { router } from "./model-router";
import { getInstallationOctokit } from "./github-app";
import { repositories, reviews, github_installations, users } from "@/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { z } from "zod";

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

    // ── Step 4: Enforce monetization cap ──
    console.log(`${logPrefix} Step 4: Checking monetization cap`);
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

    // ── Step 5: Fetch PR diff ──
    console.log(`${logPrefix} Step 5: Fetching PR data and diff`);
    const { data: prData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    const headSha = prData.head.sha;
    console.log(`${logPrefix} Step 5: PR head SHA: ${headSha}`);

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
    
    const tier = (repository.preferredTier === "deep") ? "deep" : "fast";
    console.log(`${logPrefix} Step 6: Generating AI review (tier=${tier}, categories=${categories.join(",")})`);

    const { result, provider } = await router.executeWithFailover(async (provider) => {
      const response = await generateObject({
        model: provider.model,
        system: systemPrompt,
        prompt: `Diff:\n${diffContext}`,
        schema: ReviewOutputSchema,
      });
      return response.object;
    }, "chat", tier);
    
    console.log(
      `${logPrefix} Step 6: ✅ Review generated via ${provider.name} (${provider.modelName}, key=#${provider.keyState.index}). ` +
      `Findings: ${result.findings.length}`
    );

    // ── Step 7: Post review to GitHub ──
    console.log(`${logPrefix} Step 7: Posting review to GitHub`);
    const comments = result.findings.map(f => ({
      path: f.path,
      line: f.line,
      body: `**[${f.severity} / ${f.category}]** ${f.comment}`,
    }));

    let finalSummary = result.summary;
    if (isTruncated) {
      finalSummary += "\n\n_Note: This PR was very large. Some files may have been skipped to stay within review limits._";
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

    // ── Step 8: Create check run ──
    console.log(`${logPrefix} Step 8: Creating check run`);
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

    // ── Step 9: Update DB record ──
    await db.update(reviews)
      .set({
        status: "completed",
        summary: result.summary,
        findingCount: result.findings.length,
      })
      .where(eq(reviews.id, pendingReviewId));

    console.log(`${logPrefix} ── PIPELINE COMPLETE ── (${result.findings.length} findings)`);
    
  } catch (error: any) {
    console.error(`${logPrefix} ── PIPELINE FAILED ──`, error);

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
