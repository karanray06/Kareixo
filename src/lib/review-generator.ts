import { getDb } from "@/db";
import { generateText } from "ai";
import { router } from "./model-router";
// Using octokit for GitHub API interactions
// import { Octokit } from "@octokit/rest";

export async function queueReview(installationId: number, repoFullName: string, prNumber: number) {
  try {
    // 1. Fetch PR details and diff
    console.log(`Starting review for ${repoFullName}#${prNumber}`);
    
    // In a real implementation:
    // const octokit = new Octokit({ auth: generateInstallationToken(installationId) });
    // const diff = await octokit.pulls.get({ ... });

    const fakeDiff = `
    - const a = 1;
    + const a = 2;
    `;

    // 2. Generate review using the multi-model router
    const systemPrompt = `You are Kareixo, an expert code reviewer. Analyze the following pull request diff. Identify logic errors, security flaws, performance issues, and code style improvements. Be concise.`;
    
    const { text } = await generateText({
      model: router.getNextProvider().model,
      system: systemPrompt,
      prompt: `Diff:\n${fakeDiff}`,
    });
    
    console.log(`Generated review:`, text);

    // 3. Post review to GitHub
    // await octokit.pulls.createReview({ ... });
    
    console.log(`Successfully posted review to ${repoFullName}#${prNumber}`);
    
  } catch (error) {
    console.error(`Failed to generate review for ${repoFullName}#${prNumber}`, error);
  }
}
