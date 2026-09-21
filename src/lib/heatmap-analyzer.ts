/**
 * Heatmap Analyzer — LLM-powered line-level defect probability scoring.
 *
 * Evaluates code and returns per-line defect probabilities using
 * the multi-model router with failover.
 */
import { z } from "zod";
import { generateObject } from "ai";
import { router } from "./model-router";

// ── Zod schema for LLM output ──
export const HeatmapResultSchema = z.object({
  lines: z.array(
    z.object({
      line: z.number().describe("1-indexed line number in the code."),
      defectProbability: z.number().min(0).max(1)
        .describe("Probability of a defect on this line (0.0 = clean, 1.0 = certain bug)."),
      severity: z.enum(["critical", "high", "medium", "low"])
        .describe("Severity classification of the potential defect."),
      reason: z.string()
        .describe("Concise explanation of why this line is flagged."),
      category: z.enum(["logic", "security", "performance", "race_condition", "null_reference", "type_error", "memory_leak", "error_handling", "style"])
        .describe("Category of the potential defect."),
    })
  ),
  overallRisk: z.number().min(0).max(1)
    .describe("Overall risk score for the entire code snippet."),
  summary: z.string()
    .describe("A brief summary of the code quality assessment."),
});

export type HeatmapResult = z.infer<typeof HeatmapResultSchema>;

export interface HeatmapLine {
  line: number;
  defectProbability: number;
  severity: "critical" | "high" | "medium" | "low";
  reason: string;
  category: string;
}

/**
 * Analyze code and return line-level defect probabilities.
 */
export async function analyzeCodeHeatmap(
  code: string,
  language: string,
  filename?: string
): Promise<{
  result: HeatmapResult;
  provider: string;
}> {
  const systemPrompt = `You are Kareixo Defect Predictor — an expert static analysis engine that identifies potential bugs at the line level.

RULES:
1. Analyze each line of the provided code for potential defects.
2. Return ONLY lines with defectProbability > 0.3 (skip obviously clean lines).
3. Score each line from 0.0 (certainly clean) to 1.0 (certainly buggy).
4. Categories: logic, security, performance, race_condition, null_reference, type_error, memory_leak, error_handling, style
5. Be precise — avoid false positives. A line that COULD have issues but is correctly handled should get a lower score.
6. The overallRisk is the weighted average of all flagged lines, considering severity.
7. Line numbers are 1-indexed (matching how code is displayed to developers).

SCORING GUIDE:
- 0.9-1.0: Definite bug (uncaught exception, SQL injection, infinite loop)
- 0.7-0.89: Very likely bug (race condition, unvalidated input, null dereference)
- 0.5-0.69: Probable issue (missing error handling, implicit type coercion)
- 0.3-0.49: Suspicious code (magic numbers, complex conditionals, code smell)
- Below 0.3: Do not include`;

  const userPrompt = `${filename ? `File: ${filename}\n` : ""}Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nAnalyze this code and return line-level defect probabilities.`;

  const { result, provider } = await router.executeWithFailover(async (provider) => {
    const response = await generateObject({
      model: provider.provider.model,
      system: systemPrompt,
      prompt: userPrompt,
      schema: HeatmapResultSchema,
    });
    return response.object;
  }, "code", "fast");

  // Filter out any lines below threshold (belt & suspenders)
  const filtered: HeatmapResult = {
    ...result,
    lines: result.lines.filter((l) => l.defectProbability >= 0.3),
  };

  return { result: filtered, provider: provider.name };
}
