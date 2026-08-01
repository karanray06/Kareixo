import { getDb } from "@/db";
import { generateObject } from "ai";
import { router } from "./model-router";
import { getInstallationOctokit } from "./github-app";
import { repositories, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

export async function queueReview(installationId: number, repoFullName: string, prNumber: number) {
  try {
    const db = getDb();
    console.log(`Starting real review for ${repoFullName}#${prNumber}`);
    
    const [owner, repo] = repoFullName.split("/");
    const octokit = await getInstallationOctokit(installationId);

    // 1. Fetch real PR details and diff
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

    // 2. Generate structured review
    const systemPrompt = `You are Kareixo, an expert code reviewer. Analyze the following pull request diff. Identify logic errors, security flaws, performance issues, and code style improvements. Return structured JSON with your findings. Ensure line numbers match the diff correctly.`;
    
    const { result, provider } = await router.executeWithFailover(async (provider) => {
      const response = await generateObject({
        model: provider.model,
        system: systemPrompt,
        prompt: `Diff:\n${diffContext}`,
        schema: ReviewOutputSchema,
      });
      return response.object;
    });
    
    console.log(`Generated review successfully via ${provider.name}`);

    // 3. Post review to GitHub
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
      await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        event: "COMMENT",
        body: finalSummary,
        comments: comments.length > 0 ? comments : undefined,
      });
    } catch (postError) {
      console.warn("Failed to post inline review (likely invalid line numbers), falling back to issue comment.", postError);
      // Fallback: Post as a single issue comment
      const fallbackBody = `${finalSummary}\n\n**Findings:**\n` + 
        result.findings.map(f => `- **${f.path}:${f.line}** [${f.severity} / ${f.category}]: ${f.comment}`).join("\n");
        
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: fallbackBody,
      });
    }

    // 4. Write to DB
    const [repository] = await db.select().from(repositories).where(
      and(
        eq(repositories.installationId, installationId),
        eq(repositories.fullName, repoFullName)
      )
    );

    if (repository) {
      await db.insert(reviews).values({
        repositoryId: repository.id,
        prNumber,
        status: "completed",
        summary: result.summary,
        findingCount: result.findings.length,
      });
    }
    
    console.log(`Successfully completed and logged review for ${repoFullName}#${prNumber}`);
    
  } catch (error) {
    console.error(`Failed to generate review for ${repoFullName}#${prNumber}`, error);
  }
}
