/**
 * Figranium Service — Browser automation integration for Frontend Visual QA.
 *
 * Interfaces with Figranium's REST API to run visual QA tasks against
 * PR preview URLs, capture screenshots/DOM extractions, and feed results
 * into the LLM router for regression detection.
 */
import { z } from "zod";
import { generateObject } from "ai";
import { router } from "./model-router";

// ── Configuration ──
const FIGRANIUM_BASE_URL = process.env.FIGRANIUM_API_URL || "http://localhost:3001";
const FIGRANIUM_API_KEY = process.env.FIGRANIUM_API_KEY || "";

// ── Figranium API Types ──

/** Variables passed to a Figranium task execution */
export interface FigraniumTaskVariables {
  url?: string;
  previewUrl?: string;
  selector?: string;
  waitForSelector?: string;
  viewport?: { width: number; height: number };
  [key: string]: unknown;
}

/** A single step result from Figranium */
export interface FigraniumStepResult {
  stepId: string;
  action: string;
  status: "completed" | "failed" | "skipped";
  screenshot?: string;  // Base64-encoded screenshot or URL
  extractedData?: Record<string, unknown>;
  error?: string;
  durationMs: number;
}

/** Full response from POST /api/tasks/:id/run */
export interface FigraniumTaskResponse {
  taskId: string;
  status: "completed" | "failed" | "running" | "queued";
  startedAt: string;
  completedAt?: string;
  steps: FigraniumStepResult[];
  screenshots: string[];      // Array of screenshot URLs or base64
  extractedData: Record<string, unknown>;
  domSnapshot?: string;        // Full DOM HTML snapshot
  consoleErrors: string[];     // Browser console errors captured
  networkErrors: string[];     // Failed network requests
  error?: string;
}

/** Response from GET /api/tasks/:id/status */
export interface FigraniumStatusResponse {
  taskId: string;
  status: "completed" | "failed" | "running" | "queued";
  progress: number;           // 0-100
  currentStep?: string;
}

// ── Figranium API Client ──

/**
 * Make an authenticated request to the Figranium API.
 */
async function figraniumFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${FIGRANIUM_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(FIGRANIUM_API_KEY ? { Authorization: `Bearer ${FIGRANIUM_API_KEY}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `[Figranium] ${options.method || "GET"} ${endpoint} failed (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Trigger a Figranium visual QA task against a preview URL.
 *
 * @param previewUrl - The PR preview deployment URL to test
 * @param taskId - The predefined Figranium task ID to execute
 * @param extraVariables - Additional variables to pass to the task
 */
export async function runVisualQA(
  previewUrl: string,
  taskId: string,
  extraVariables: FigraniumTaskVariables = {}
): Promise<FigraniumTaskResponse> {
  console.log(`[Figranium] Running visual QA task ${taskId} against ${previewUrl}`);

  const response = await figraniumFetch<FigraniumTaskResponse>(
    `/api/tasks/${taskId}/run`,
    {
      method: "POST",
      body: JSON.stringify({
        variables: {
          url: previewUrl,
          previewUrl,
          ...extraVariables,
        },
      }),
    }
  );

  console.log(
    `[Figranium] Task ${taskId} completed: status=${response.status}, ` +
    `screenshots=${response.screenshots.length}, ` +
    `consoleErrors=${response.consoleErrors.length}`
  );

  return response;
}

/**
 * Poll a Figranium task until completion.
 */
export async function waitForTask(
  taskId: string,
  timeoutMs: number = 120_000,
  pollIntervalMs: number = 3000
): Promise<FigraniumTaskResponse> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await figraniumFetch<FigraniumStatusResponse>(
      `/api/tasks/${taskId}/status`
    );

    if (status.status === "completed" || status.status === "failed") {
      // Fetch the full result
      return figraniumFetch<FigraniumTaskResponse>(`/api/tasks/${taskId}/result`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`[Figranium] Task ${taskId} timed out after ${timeoutMs}ms`);
}

/**
 * Extract screenshot data from a Figranium task response.
 * Returns the primary screenshot (first one) and all metadata.
 */
export function extractScreenshotData(response: FigraniumTaskResponse): {
  primaryScreenshot: string | null;
  allScreenshots: string[];
  domSnapshot: string | null;
  consoleErrors: string[];
  networkErrors: string[];
  extractedData: Record<string, unknown>;
} {
  return {
    primaryScreenshot: response.screenshots[0] || null,
    allScreenshots: response.screenshots,
    domSnapshot: response.domSnapshot || null,
    consoleErrors: response.consoleErrors,
    networkErrors: response.networkErrors,
    extractedData: response.extractedData,
  };
}

// ── LLM Visual Regression Analysis ──

/** Zod schema for visual regression analysis */
const VisualRegressionSchema = z.object({
  hasRegression: z.boolean()
    .describe("Whether a visual regression was detected."),
  confidence: z.number().min(0).max(1)
    .describe("Confidence in the regression assessment (0-1)."),
  issues: z.array(
    z.object({
      severity: z.enum(["critical", "major", "minor", "cosmetic"])
        .describe("Severity of the visual issue."),
      description: z.string()
        .describe("Description of the visual regression."),
      location: z.string()
        .describe("Where on the page the issue was found."),
      suggestion: z.string()
        .describe("Suggested fix for the regression."),
    })
  ),
  summary: z.string()
    .describe("Overall assessment of the visual state."),
  uiIntact: z.boolean()
    .describe("Whether the core UI structure appears intact."),
});

export type VisualRegressionResult = z.infer<typeof VisualRegressionSchema>;

/**
 * Analyze Figranium output with an LLM to detect visual regressions.
 *
 * Takes DOM snapshots, console errors, and network errors from Figranium
 * and asks the LLM to assess whether the PR introduced visual regressions.
 */
export async function analyzeVisualRegression(options: {
  previewUrl: string;
  figraniumResult: FigraniumTaskResponse;
  prTitle?: string;
  prDiff?: string;
}): Promise<{
  result: VisualRegressionResult;
  provider: string;
}> {
  const { previewUrl, figraniumResult, prTitle, prDiff } = options;
  const data = extractScreenshotData(figraniumResult);

  const systemPrompt = `You are Kareixo Visual QA — an expert frontend regression detector.

You analyze the output from a browser automation tool (Figranium) that visited a PR preview deployment. Your job is to determine if the PR introduced visual regressions.

INPUTS YOU RECEIVE:
1. DOM snapshot (HTML structure of the page)
2. Browser console errors (JavaScript errors, warnings)
3. Failed network requests
4. Extracted page metadata

ANALYSIS RULES:
1. Console errors are HIGH priority — any new JavaScript error is likely a regression.
2. Network errors (failed API calls, missing assets) are CRITICAL — they indicate broken functionality.
3. DOM structure issues (missing elements, empty containers) suggest rendering failures.
4. Rate the confidence of your assessment from 0.0 to 1.0.
5. If there are zero console errors and zero network errors, the UI is likely intact.
6. Be specific about locations and provide actionable fix suggestions.`;

  const sections: string[] = [
    `Preview URL: ${previewUrl}`,
    `Task Status: ${figraniumResult.status}`,
  ];

  if (prTitle) sections.push(`PR Title: ${prTitle}`);

  if (data.consoleErrors.length > 0) {
    sections.push(
      `\nBrowser Console Errors (${data.consoleErrors.length}):\n` +
      data.consoleErrors.slice(0, 20).map((e, i) => `${i + 1}. ${e}`).join("\n")
    );
  } else {
    sections.push("\nBrowser Console: ✅ No errors");
  }

  if (data.networkErrors.length > 0) {
    sections.push(
      `\nFailed Network Requests (${data.networkErrors.length}):\n` +
      data.networkErrors.slice(0, 10).map((e, i) => `${i + 1}. ${e}`).join("\n")
    );
  } else {
    sections.push("\nNetwork Requests: ✅ All successful");
  }

  if (data.domSnapshot) {
    // Truncate DOM to avoid token limits
    const truncatedDom = data.domSnapshot.length > 8000
      ? data.domSnapshot.slice(0, 8000) + "\n...[DOM truncated]"
      : data.domSnapshot;
    sections.push(`\nDOM Snapshot:\n\`\`\`html\n${truncatedDom}\n\`\`\``);
  }

  if (Object.keys(data.extractedData).length > 0) {
    sections.push(
      `\nExtracted Page Data:\n\`\`\`json\n${JSON.stringify(data.extractedData, null, 2).slice(0, 2000)}\n\`\`\``
    );
  }

  // Include step-level errors from Figranium
  const failedSteps = figraniumResult.steps.filter((s) => s.status === "failed");
  if (failedSteps.length > 0) {
    sections.push(
      `\nFailed Automation Steps:\n` +
      failedSteps.map((s) => `- ${s.action}: ${s.error || "Unknown error"}`).join("\n")
    );
  }

  if (prDiff) {
    const truncatedDiff = prDiff.length > 3000
      ? prDiff.slice(0, 3000) + "\n...[diff truncated]"
      : prDiff;
    sections.push(`\nPR Diff (for context):\n\`\`\`diff\n${truncatedDiff}\n\`\`\``);
  }

  sections.push("\nAnalyze the above data and determine if this PR introduced visual regressions.");

  const userPrompt = sections.join("\n");

  const { result, provider } = await router.executeWithFailover(async (prov) => {
    const response = await generateObject({
      model: prov.model,
      system: systemPrompt,
      prompt: userPrompt,
      schema: VisualRegressionSchema,
    });
    return response.object;
  }, "code", "fast");

  return { result, provider: provider.name };
}

/**
 * Run the full Visual QA pipeline:
 * 1. Execute Figranium task against preview URL
 * 2. Analyze results with LLM
 * 3. Return structured regression report
 */
export async function runFullVisualQAPipeline(options: {
  previewUrl: string;
  figraniumTaskId: string;
  prTitle?: string;
  prDiff?: string;
  extraVariables?: FigraniumTaskVariables;
}): Promise<{
  figraniumResult: FigraniumTaskResponse;
  analysis: VisualRegressionResult;
  provider: string;
}> {
  const { previewUrl, figraniumTaskId, prTitle, prDiff, extraVariables } = options;

  // Step 1: Run Figranium task
  const figraniumResult = await runVisualQA(previewUrl, figraniumTaskId, extraVariables);

  // Step 2: Analyze with LLM
  const { result: analysis, provider } = await analyzeVisualRegression({
    previewUrl,
    figraniumResult,
    prTitle,
    prDiff,
  });

  console.log(
    `[Figranium] Visual QA complete: regression=${analysis.hasRegression}, ` +
    `confidence=${analysis.confidence}, issues=${analysis.issues.length}, ` +
    `provider=${provider}`
  );

  return { figraniumResult, analysis, provider };
}
