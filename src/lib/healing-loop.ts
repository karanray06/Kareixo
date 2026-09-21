/**
 * Execution-Calibrated Auto-Healing Loop
 *
 * Self-healing CI engine that:
 * 1. Boots E2B sandbox + clones repo
 * 2. Runs tests to confirm failure
 * 3. Fetches failing file, parses with tree-sitter
 * 4. Generates AST-bounded patch via LLM
 * 5. Applies patch + re-runs tests
 * 6. If tests pass → auto-commits fix to PR
 * 7. If tests fail → retries with stderr context (max 3 iterations)
 */
import { Sandbox } from "e2b";
import { getInstallationOctokit } from "./github-app";
import { parseCode, findErrorNodes, detectLanguage } from "./ast/parser";
import { applyMutations, summarizeMutations } from "./ast/mutation";
import { generateTestFixMutations } from "./ast/prompt";

const SANDBOX_TIMEOUT_MS = 180_000; // 3 minutes
const MAX_HEAL_ATTEMPTS = 3;
const MAX_OUTPUT_BYTES = 10_000;

function truncate(s: string, max = MAX_OUTPUT_BYTES): string {
  return s.length <= max ? s : s.slice(0, max) + "\n...[truncated]";
}

export interface HealingResult {
  success: boolean;
  attempts: number;
  finalStderr: string;
  commitSha?: string;
  summary: string;
  provider?: string;
}

export interface HealingOptions {
  installationId: number;
  owner: string;
  repo: string;
  branch: string;
  headSha: string;
  prNumber?: number;
  failedJobName?: string;
}

/**
 * Execute the auto-healing loop.
 */
export async function executeHealingLoop(
  options: HealingOptions
): Promise<HealingResult> {
  const { installationId, owner, repo, branch, headSha, prNumber, failedJobName } = options;
  const logPrefix = `[AutoHeal ${owner}/${repo}@${branch}]`;

  console.log(`${logPrefix} ── HEALING LOOP START ──`);

  if (!process.env.E2B_API_KEY) {
    console.warn(`${logPrefix} No E2B_API_KEY — aborting`);
    return {
      success: false,
      attempts: 0,
      finalStderr: "E2B_API_KEY not configured",
      summary: "Auto-healing skipped — no E2B API key",
    };
  }

  let sandbox: Sandbox | null = null;
  const previousAttempts: string[] = [];

  try {
    // ── Step 1: Boot sandbox ──
    console.log(`${logPrefix} Step 1: Booting E2B sandbox`);
    sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: SANDBOX_TIMEOUT_MS,
    });

    // ── Step 2: Clone repo ──
    console.log(`${logPrefix} Step 2: Cloning ${owner}/${repo}@${branch}`);
    let cloneUrl = `https://github.com/${owner}/${repo}.git`;
    const octokit = await getInstallationOctokit(installationId);

    try {
      const { data: { token } } = await octokit.rest.apps.createInstallationAccessToken({
        installation_id: installationId,
      });
      cloneUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
    } catch {
      console.warn(`${logPrefix} Could not get installation token`);
    }

    const cloneResult = await sandbox.commands.run(
      `git clone --depth 5 --branch ${branch} ${cloneUrl} /home/user/repo`,
      { timeoutMs: 60_000 }
    );

    if (cloneResult.exitCode !== 0) {
      return {
        success: false,
        attempts: 0,
        finalStderr: truncate(cloneResult.stderr),
        summary: "Failed to clone repository",
      };
    }

    // ── Step 3: Install dependencies ──
    console.log(`${logPrefix} Step 3: Installing dependencies`);
    await sandbox.commands.run("npm install --legacy-peer-deps", {
      cwd: "/home/user/repo",
      timeoutMs: 90_000,
    });

    // ── Step 4: Confirm test failure ──
    console.log(`${logPrefix} Step 4: Confirming test failure`);
    const initialTest = await sandbox.commands.run("npm test 2>&1", {
      cwd: "/home/user/repo",
      timeoutMs: 90_000,
    });

    if (initialTest.exitCode === 0) {
      console.log(`${logPrefix} Tests already pass — nothing to heal`);
      return {
        success: true,
        attempts: 0,
        finalStderr: "",
        summary: "Tests already pass — no healing needed",
      };
    }

    let currentStderr = truncate(initialTest.stdout + "\n" + initialTest.stderr);
    console.log(`${logPrefix} Tests confirmed failing (exit=${initialTest.exitCode})`);

    // ── Step 5: Healing loop ──
    for (let attempt = 1; attempt <= MAX_HEAL_ATTEMPTS; attempt++) {
      console.log(`${logPrefix} ── Attempt ${attempt}/${MAX_HEAL_ATTEMPTS} ──`);

      // 5a: Parse stderr to identify the failing file
      const failingFile = extractFailingFile(currentStderr);
      if (!failingFile) {
        console.warn(`${logPrefix} Could not identify failing file from stderr`);
        previousAttempts.push(`Attempt ${attempt}: Could not identify failing file`);
        continue;
      }

      console.log(`${logPrefix} Target file: ${failingFile}`);

      // 5b: Read the file from sandbox
      const catResult = await sandbox.commands.run(`cat /home/user/repo/${failingFile}`, {
        timeoutMs: 5_000,
      });

      if (catResult.exitCode !== 0) {
        previousAttempts.push(`Attempt ${attempt}: Could not read ${failingFile}`);
        continue;
      }

      const source = catResult.stdout;
      const language = detectLanguage(failingFile);

      // 5c: Parse with tree-sitter
      const tree = await parseCode(source, language);
      const errorNodes = findErrorNodes(tree);

      // 5d: Generate AST-bounded mutations via LLM
      console.log(`${logPrefix} Generating mutations (errors=${errorNodes.length})`);
      let mutationResult;

      try {
        mutationResult = await generateTestFixMutations({
          source,
          language,
          filePath: failingFile,
          stderr: currentStderr,
          previousAttempts,
        });
      } catch (err: any) {
        console.error(`${logPrefix} LLM generation failed:`, err.message);
        previousAttempts.push(`Attempt ${attempt}: LLM failed — ${err.message}`);
        continue;
      }

      console.log(
        `${logPrefix} Got ${mutationResult.mutations.length} mutations via ${mutationResult.provider}`
      );

      // 5e: Apply mutations
      const patchResult = await applyMutations(source, mutationResult.mutations, language);

      if (!patchResult.valid) {
        console.warn(`${logPrefix} Patch validation failed — ${patchResult.errors.length} syntax errors`);
        previousAttempts.push(
          `Attempt ${attempt}: Patch had syntax errors — ${patchResult.errors.map((e) => e.type).join(", ")}`
        );
        continue;
      }

      // 5f: Write patched file to sandbox
      await sandbox.files.write(`/home/user/repo/${failingFile}`, patchResult.patchedSource);
      console.log(`${logPrefix} Patch applied to ${failingFile}`);

      // 5g: Re-run tests
      const testResult = await sandbox.commands.run("npm test 2>&1", {
        cwd: "/home/user/repo",
        timeoutMs: 90_000,
      });

      if (testResult.exitCode === 0) {
        console.log(`${logPrefix} ✅ Tests PASS on attempt ${attempt}!`);

        // 5h: Commit the fix back to the PR
        const commitSha = await commitFixToGitHub({
          octokit,
          owner,
          repo,
          branch,
          headSha,
          filePath: failingFile,
          newContent: patchResult.patchedSource,
          mutations: mutationResult.mutations,
          summary: mutationResult.summary,
          provider: mutationResult.provider,
        });

        // Post a comment on the PR if we have a PR number
        if (prNumber) {
          await postHealingComment(octokit, owner, repo, prNumber, {
            attempts: attempt,
            summary: mutationResult.summary,
            mutations: summarizeMutations(mutationResult.mutations),
            provider: mutationResult.provider,
          }).catch(console.error);
        }

        return {
          success: true,
          attempts: attempt,
          finalStderr: "",
          commitSha,
          summary: mutationResult.summary,
          provider: mutationResult.provider,
        };
      }

      // Tests still failing — feed stderr back
      currentStderr = truncate(testResult.stdout + "\n" + testResult.stderr);
      previousAttempts.push(
        `Attempt ${attempt}: ${mutationResult.summary} — tests still failing`
      );

      console.warn(`${logPrefix} Tests still failing after attempt ${attempt}`);
    }

    // All attempts exhausted
    console.error(`${logPrefix} ── HEALING FAILED after ${MAX_HEAL_ATTEMPTS} attempts ──`);

    if (prNumber) {
      const octokit2 = await getInstallationOctokit(installationId);
      await octokit2.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body:
          `⚠️ **Kareixo Auto-Heal** attempted ${MAX_HEAL_ATTEMPTS} fixes but could not resolve the test failure.\n\n` +
          `**Attempts:**\n${previousAttempts.map((a) => `- ${a}`).join("\n")}\n\n` +
          `**Last error:**\n\`\`\`\n${currentStderr.slice(0, 1000)}\n\`\`\`\n\n` +
          `_Manual intervention required._`,
      }).catch(console.error);
    }

    return {
      success: false,
      attempts: MAX_HEAL_ATTEMPTS,
      finalStderr: currentStderr,
      summary: `Failed after ${MAX_HEAL_ATTEMPTS} attempts`,
    };

  } catch (error: any) {
    console.error(`${logPrefix} ── HEALING LOOP ERROR ──`, error);
    return {
      success: false,
      attempts: 0,
      finalStderr: error.message,
      summary: `Healing loop error: ${error.message?.slice(0, 200)}`,
    };
  } finally {
    if (sandbox) {
      try {
        await sandbox.kill();
        console.log(`${logPrefix} Sandbox terminated`);
      } catch (err: any) {
        console.warn(`${logPrefix} Failed to kill sandbox:`, err.message);
      }
    }
  }
}

// ── Helpers ──

/**
 * Extract the most likely failing file path from test stderr output.
 */
function extractFailingFile(stderr: string): string | null {
  // Common patterns:
  // FAIL  src/__tests__/foo.test.ts
  // Error: src/lib/bar.ts(42,5): error TS2339
  // at Object.<anonymous> (src/components/Baz.tsx:12:3)
  const patterns = [
    /FAIL\s+(\S+\.[jt]sx?)/i,
    /Error:?\s*(\S+\.[jt]sx?)/i,
    /at\s+\S+\s+\((\S+\.[jt]sx?):\d+/,
    /(\S+\.[jt]sx?)[\(:]\d+/,
  ];

  for (const pattern of patterns) {
    const match = stderr.match(pattern);
    if (match?.[1]) {
      // Clean up the path
      let filePath = match[1].replace(/^['"]+|['"]+$/g, "");
      if (filePath.startsWith("./")) filePath = filePath.slice(2);
      return filePath;
    }
  }

  return null;
}

/**
 * Commit the fixed file back to the PR branch via GitHub API.
 */
async function commitFixToGitHub(options: {
  octokit: Awaited<ReturnType<typeof getInstallationOctokit>>;
  owner: string;
  repo: string;
  branch: string;
  headSha: string;
  filePath: string;
  newContent: string;
  mutations: any[];
  summary: string;
  provider: string;
}): Promise<string> {
  const { octokit, owner, repo, branch, filePath, newContent, summary, provider } = options;

  // Get the current tree SHA
  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const latestSha = ref.object.sha;

  // Create a blob with the new content
  const { data: blob } = await octokit.rest.git.createBlob({
    owner,
    repo,
    content: Buffer.from(newContent).toString("base64"),
    encoding: "base64",
  });

  // Get the current tree
  const { data: currentCommit } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: latestSha,
  });

  // Create new tree with the updated file
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: currentCommit.tree.sha,
    tree: [
      {
        path: filePath,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      },
    ],
  });

  // Create commit
  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: `[Kareixo Auto-Heal] Verified fix applied\n\n${summary}\n\nProvider: ${provider}`,
    tree: newTree.sha,
    parents: [latestSha],
  });

  // Update the branch reference
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
  });

  console.log(`[AutoHeal] ✅ Committed fix: ${newCommit.sha}`);
  return newCommit.sha;
}

/**
 * Post a success comment on the PR.
 */
async function postHealingComment(
  octokit: Awaited<ReturnType<typeof getInstallationOctokit>>,
  owner: string,
  repo: string,
  prNumber: number,
  result: { attempts: number; summary: string; mutations: string; provider: string }
): Promise<void> {
  const body =
    `🔧 **Kareixo Auto-Heal** — Verified fix applied ✅\n\n` +
    `**Summary:** ${result.summary}\n\n` +
    `**Mutations applied:**\n${result.mutations}\n\n` +
    `_Fixed in ${result.attempts} attempt(s) via ${result.provider}. ` +
    `Tests verified passing in E2B sandbox before commit._`;

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });
}
