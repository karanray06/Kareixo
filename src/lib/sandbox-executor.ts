/**
 * E2B Sandbox Executor — runs PR code in a secure Firecracker microVM.
 *
 * Clones the PR branch, runs install + test, captures stdout/stderr,
 * and returns structured results for the AI reviewer.
 *
 * Graceful degradation: if E2B_API_KEY is missing or sandbox fails,
 * the review pipeline continues without sandbox results.
 */
import { Sandbox } from "e2b";
import type { SandboxResultSummary } from "./pipeline-events";
import { emitPipelineStep, setSandboxResult } from "./pipeline-events";
import { getInstallationOctokit } from "./github-app";

const SANDBOX_TIMEOUT_MS = 120_000; // 2 minutes max
const MAX_OUTPUT_BYTES = 15_000; // 15KB per stream

function truncateOutput(output: string): string {
  if (output.length <= MAX_OUTPUT_BYTES) return output;
  return (
    output.slice(0, MAX_OUTPUT_BYTES) +
    "\n\n... [truncated — output exceeded 15KB]"
  );
}

export interface SandboxExecutionOptions {
  owner: string;
  repo: string;
  branch: string; // The PR head branch
  installationId: number;
  reviewId: string;
}

/**
 * Execute PR code in an E2B sandbox.
 *
 * Returns null if:
 * - E2B_API_KEY is not set
 * - Sandbox creation fails
 * - Any unrecoverable error occurs
 *
 * The caller should treat null as "sandbox skipped" and continue.
 */
export async function executeSandbox(
  options: SandboxExecutionOptions
): Promise<SandboxResultSummary | null> {
  const { owner, repo, branch, installationId, reviewId } = options;

  // ── Guard: skip if no API key ──
  if (!process.env.E2B_API_KEY) {
    console.log(`[Sandbox] No E2B_API_KEY set — skipping sandbox execution`);
    emitPipelineStep(reviewId, "sandbox_skipped", "skipped", "E2B_API_KEY not configured");
    return null;
  }

  const startTime = Date.now();
  let sandbox: Sandbox | null = null;

  try {
    // ── Step 1: Boot sandbox ──
    emitPipelineStep(reviewId, "sandbox_booting", "active", "Starting Firecracker microVM...");
    console.log(`[Sandbox] Booting E2B sandbox for ${owner}/${repo}#${branch}`);

    sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: SANDBOX_TIMEOUT_MS,
    });

    console.log(`[Sandbox] ✅ Sandbox created (id=${sandbox.sandboxId})`);

    // ── Step 2: Generate a temporary clone URL ──
    // Use the installation token for private repo access
    emitPipelineStep(reviewId, "sandbox_cloning", "active", `Cloning ${owner}/${repo}@${branch}`);

    let cloneUrl = `https://github.com/${owner}/${repo}.git`;
    try {
      const octokit = await getInstallationOctokit(installationId);
      const { data: { token } } = await octokit.rest.apps.createInstallationAccessToken({
        installation_id: installationId,
      });
      cloneUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
    } catch (authErr) {
      console.warn(`[Sandbox] Could not get installation token, falling back to public clone`);
    }

    const cloneResult = await sandbox.commands.run(
      `git clone --depth 1 --branch ${branch} ${cloneUrl} /home/user/repo`,
      { timeoutMs: 60_000 }
    );

    if (cloneResult.exitCode !== 0) {
      const result: SandboxResultSummary = {
        success: false,
        stdout: truncateOutput(cloneResult.stdout),
        stderr: truncateOutput(cloneResult.stderr),
        exitCode: cloneResult.exitCode,
        durationMs: Date.now() - startTime,
        error: "Git clone failed",
      };
      emitPipelineStep(reviewId, "sandbox_failed", "failed", "Git clone failed");
      setSandboxResult(reviewId, result);
      return result;
    }

    console.log(`[Sandbox] ✅ Repository cloned`);

    // ── Step 3: Detect package manager and install ──
    emitPipelineStep(reviewId, "sandbox_installing", "active", "Installing dependencies...");

    // Check which lockfile exists to determine package manager
    const lsResult = await sandbox.commands.run("ls /home/user/repo", { timeoutMs: 5_000 });
    const files = lsResult.stdout;
    
    let installCmd = "npm install --legacy-peer-deps";
    let testCmd = "npm test";
    
    if (files.includes("yarn.lock")) {
      installCmd = "yarn install --frozen-lockfile";
      testCmd = "yarn test";
    } else if (files.includes("pnpm-lock.yaml")) {
      installCmd = "pnpm install --frozen-lockfile";
      testCmd = "pnpm test";
    }

    const installResult = await sandbox.commands.run(installCmd, {
      cwd: "/home/user/repo",
      timeoutMs: 90_000,
    });

    if (installResult.exitCode !== 0) {
      const result: SandboxResultSummary = {
        success: false,
        stdout: truncateOutput(installResult.stdout),
        stderr: truncateOutput(installResult.stderr),
        exitCode: installResult.exitCode,
        durationMs: Date.now() - startTime,
        error: "Dependency installation failed",
      };
      emitPipelineStep(reviewId, "sandbox_failed", "failed", "npm install failed");
      setSandboxResult(reviewId, result);
      return result;
    }

    console.log(`[Sandbox] ✅ Dependencies installed`);

    // ── Step 4: Check if test script exists ──
    const pkgJsonResult = await sandbox.commands.run(
      "cat /home/user/repo/package.json",
      { timeoutMs: 5_000 }
    );

    let hasTestScript = false;
    try {
      const pkgJson = JSON.parse(pkgJsonResult.stdout);
      hasTestScript = !!pkgJson.scripts?.test && pkgJson.scripts.test !== 'echo "Error: no test specified" && exit 1';
    } catch {
      // Can't parse package.json — skip tests
    }

    if (!hasTestScript) {
      const result: SandboxResultSummary = {
        success: true,
        stdout: "No test script found in package.json — skipping tests.\nBuild and install succeeded.",
        stderr: "",
        exitCode: 0,
        durationMs: Date.now() - startTime,
      };
      emitPipelineStep(reviewId, "sandbox_complete", "complete", "No test script — install succeeded");
      setSandboxResult(reviewId, result);
      return result;
    }

    // ── Step 5: Run tests ──
    emitPipelineStep(reviewId, "sandbox_testing", "active", `Running ${testCmd}...`);
    console.log(`[Sandbox] Running tests: ${testCmd}`);

    const testResult = await sandbox.commands.run(testCmd, {
      cwd: "/home/user/repo",
      timeoutMs: 90_000,
    });

    const result: SandboxResultSummary = {
      success: testResult.exitCode === 0,
      stdout: truncateOutput(testResult.stdout),
      stderr: truncateOutput(testResult.stderr),
      exitCode: testResult.exitCode,
      durationMs: Date.now() - startTime,
    };

    if (result.success) {
      emitPipelineStep(reviewId, "sandbox_complete", "complete", `Tests passed (${result.durationMs}ms)`);
    } else {
      emitPipelineStep(reviewId, "sandbox_complete", "complete", `Tests failed (exit code ${result.exitCode})`);
    }

    setSandboxResult(reviewId, result);
    console.log(
      `[Sandbox] ✅ Tests ${result.success ? "passed" : "failed"} ` +
        `(exit=${result.exitCode}, ${result.durationMs}ms)`
    );

    return result;
  } catch (error: any) {
    console.error(`[Sandbox] ❌ Sandbox execution failed:`, error?.message);

    const result: SandboxResultSummary = {
      success: false,
      stdout: "",
      stderr: error?.message || "Unknown sandbox error",
      exitCode: null,
      durationMs: Date.now() - startTime,
      error: `Sandbox error: ${error?.message?.slice(0, 300)}`,
    };

    emitPipelineStep(reviewId, "sandbox_failed", "failed", error?.message?.slice(0, 200));
    setSandboxResult(reviewId, result);
    return result;
  } finally {
    // ── Always kill the sandbox ──
    if (sandbox) {
      try {
        await sandbox.kill();
        console.log(`[Sandbox] Sandbox terminated`);
      } catch (killErr: any) {
        console.warn(`[Sandbox] Failed to kill sandbox:`, killErr?.message);
      }
    }
  }
}

/**
 * Format sandbox results as context for the AI prompt.
 */
export function formatSandboxContext(result: SandboxResultSummary): string {
  const sections: string[] = [
    `\n\n── Sandbox Test Execution Results ──`,
    `Exit Code: ${result.exitCode ?? "N/A"}`,
    `Duration: ${result.durationMs}ms`,
    `Status: ${result.success ? "✅ PASSED" : "❌ FAILED"}`,
  ];

  if (result.error) {
    sections.push(`\nSandbox Error: ${result.error}`);
  }

  if (result.stdout.trim()) {
    sections.push(`\nSTDOUT:\n\`\`\`\n${result.stdout.trim()}\n\`\`\``);
  }

  if (result.stderr.trim()) {
    sections.push(`\nSTDERR:\n\`\`\`\n${result.stderr.trim()}\n\`\`\``);
  }

  sections.push(
    `\nUse these test results to inform your review. If tests failed, identify the root cause from the error output and suggest specific fixes.`
  );

  return sections.join("\n");
}
