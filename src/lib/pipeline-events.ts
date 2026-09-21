/**
 * Pipeline Events — lightweight in-memory state store for review pipeline tracking.
 *
 * Each review gets a PipelineRun with timestamped steps. The frontend polls
 * /api/reviews/[id]/pipeline to get the current state.
 *
 * NOTE: This is in-memory and will reset on cold starts / deploys.
 * For persistence, swap the Map for a DB-backed store.
 */

export type PipelineStepName =
  | "authenticating"
  | "fetching_pr"
  | "checking_cap"
  | "sandbox_booting"
  | "sandbox_cloning"
  | "sandbox_installing"
  | "sandbox_testing"
  | "sandbox_complete"
  | "sandbox_skipped"
  | "sandbox_failed"
  | "llm_routing"
  | "llm_failover"
  | "llm_complete"
  | "posting_review"
  | "creating_check"
  | "complete"
  | "failed";

export type StepStatus = "active" | "complete" | "failed" | "skipped";

export interface PipelineStepEntry {
  step: PipelineStepName;
  status: StepStatus;
  timestamp: string; // ISO 8601
  detail?: string;
  provider?: string;
  failoverFrom?: string;
}

export interface SandboxResultSummary {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  error?: string;
}

export interface PipelineRun {
  reviewId: string;
  repoFullName: string;
  prNumber: number;
  steps: PipelineStepEntry[];
  currentStep: PipelineStepName | null;
  sandboxResult?: SandboxResultSummary;
  aiSummary?: string;
  provider?: string;
  startedAt: string;
  completedAt?: string;
}

// ── In-memory store (max 100 runs, LRU eviction) ──
const MAX_RUNS = 100;
const pipelineStore = new Map<string, PipelineRun>();

export function createPipelineRun(
  reviewId: string,
  repoFullName: string,
  prNumber: number
): PipelineRun {
  // Evict oldest if at capacity
  if (pipelineStore.size >= MAX_RUNS) {
    const oldestKey = pipelineStore.keys().next().value;
    if (oldestKey) pipelineStore.delete(oldestKey);
  }

  const run: PipelineRun = {
    reviewId,
    repoFullName,
    prNumber,
    steps: [],
    currentStep: null,
    startedAt: new Date().toISOString(),
  };

  pipelineStore.set(reviewId, run);
  return run;
}

export function emitPipelineStep(
  reviewId: string,
  step: PipelineStepName,
  status: StepStatus = "active",
  detail?: string,
  extra?: { provider?: string; failoverFrom?: string }
): void {
  const run = pipelineStore.get(reviewId);
  if (!run) return;

  // If there's a currently active step, mark it complete (unless this is a failure)
  if (run.currentStep && status === "active") {
    const prevStep = run.steps.find(
      (s) => s.step === run.currentStep && s.status === "active"
    );
    if (prevStep) {
      prevStep.status = "complete";
    }
  }

  const entry: PipelineStepEntry = {
    step,
    status,
    timestamp: new Date().toISOString(),
    detail,
    provider: extra?.provider,
    failoverFrom: extra?.failoverFrom,
  };

  run.steps.push(entry);

  if (status === "active") {
    run.currentStep = step;
  } else if (step === "complete" || step === "failed") {
    run.currentStep = step;
    run.completedAt = new Date().toISOString();
  }
}

export function setSandboxResult(
  reviewId: string,
  result: SandboxResultSummary
): void {
  const run = pipelineStore.get(reviewId);
  if (!run) return;
  run.sandboxResult = result;
}

export function setAISummary(
  reviewId: string,
  summary: string,
  provider: string
): void {
  const run = pipelineStore.get(reviewId);
  if (!run) return;
  run.aiSummary = summary;
  run.provider = provider;
}

export function getPipelineRun(reviewId: string): PipelineRun | undefined {
  return pipelineStore.get(reviewId);
}

/**
 * Get the most recent pipeline run (for the dashboard when no specific ID is provided).
 */
export function getLatestPipelineRun(): PipelineRun | undefined {
  let latest: PipelineRun | undefined;
  for (const run of pipelineStore.values()) {
    if (!latest || run.startedAt > latest.startedAt) {
      latest = run;
    }
  }
  return latest;
}

/**
 * Get all pipeline runs, sorted newest first.
 */
export function getAllPipelineRuns(): PipelineRun[] {
  return Array.from(pipelineStore.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}
