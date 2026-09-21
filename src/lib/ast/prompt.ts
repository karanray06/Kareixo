/**
 * AST Prompt Builder — constructs structured LLM prompts that constrain
 * the model to produce valid NodeMutation[] JSON payloads.
 */
import { z } from "zod";
import { generateObject } from "ai";
import { router } from "../model-router";
import type { ASTNode } from "./parser";
import type { NodeMutation } from "./mutation";
import { getNodeContext, type SupportedLanguage } from "./parser";

// ── Zod schema for LLM output validation ──
export const NodeMutationSchema = z.object({
  mutations: z.array(
    z.object({
      action: z.enum(["replace", "insert_before", "insert_after", "delete"])
        .describe("The mutation action to perform."),
      targetNodeType: z.string()
        .describe("The tree-sitter node type being targeted (e.g. 'call_expression', 'variable_declaration')."),
      targetStartLine: z.number()
        .describe("0-indexed start line of the code to modify."),
      targetEndLine: z.number()
        .describe("0-indexed end line of the code to modify (inclusive)."),
      newCodeFragment: z.string()
        .describe("The replacement source code text. Must be syntactically valid. Empty string for 'delete' action."),
      explanation: z.string()
        .describe("Why this mutation is necessary — reference the specific bug or issue."),
    })
  ),
  summary: z.string()
    .describe("A one-sentence summary of all mutations being proposed."),
});

export type NodeMutationResponse = z.infer<typeof NodeMutationSchema>;

/**
 * Build the system prompt that constrains the LLM to AST-bounded output.
 */
function buildSystemPrompt(): string {
  return `You are Kareixo AST Engine — an expert code repair system. You operate on Abstract Syntax Tree (AST) nodes, NOT raw text.

CRITICAL RULES:
1. You MUST return a JSON object with a "mutations" array and "summary" string.
2. Each mutation targets a specific line range in the source code.
3. The "newCodeFragment" MUST be syntactically valid — zero unclosed brackets, quotes, or parentheses.
4. Preserve existing indentation and formatting. Match the surrounding code style.
5. Do NOT add imports unless absolutely necessary. If you add an import, it must be a separate mutation with action "insert_before" targeting line 0.
6. Line numbers are 0-indexed.
7. For "replace" actions, the newCodeFragment replaces everything from targetStartLine to targetEndLine (inclusive).
8. For "delete" actions, newCodeFragment should be an empty string.
9. Never generate more than 5 mutations in a single response.
10. Each mutation must include a clear explanation.`;
}

/**
 * Build the user prompt with error context.
 */
function buildErrorFixPrompt(
  source: string,
  errorNodes: ASTNode[],
  language: SupportedLanguage,
  stderr?: string
): string {
  const sections: string[] = [
    `Language: ${language}`,
    `\nFull source code:\n\`\`\`${language}\n${source}\n\`\`\``,
  ];

  if (errorNodes.length > 0) {
    sections.push(`\nSyntax errors found by the AST parser:`);
    for (const node of errorNodes) {
      const ctx = getNodeContext(
        source,
        node.startPosition.row,
        node.endPosition.row,
        3
      );
      sections.push(
        `- **${node.type}** at line ${node.startPosition.row + 1}, col ${node.startPosition.column}` +
        `\n  Parent: ${node.parentType || "root"}` +
        `\n  Text: \`${node.text.slice(0, 100)}\`` +
        `\n  Context:\n\`\`\`\n${ctx.contextCode}\n\`\`\``
      );
    }
  }

  if (stderr) {
    sections.push(
      `\nTest execution error output:\n\`\`\`\n${stderr.slice(0, 3000)}\n\`\`\`` +
      `\n\nAnalyze this error output to identify the root cause and propose targeted fixes.`
    );
  }

  sections.push(
    `\nGenerate the minimal set of mutations to fix all issues. ` +
    `Ensure every newCodeFragment is syntactically valid ${language}.`
  );

  return sections.join("\n");
}

/**
 * Generate AST-bounded mutations from the LLM.
 *
 * Uses the multi-model router with failover (Groq → Gemini → Pollinations).
 */
export async function generateASTMutations(options: {
  source: string;
  language: SupportedLanguage;
  errorNodes: ASTNode[];
  stderr?: string;
  tier?: "fast" | "deep";
}): Promise<{
  mutations: NodeMutation[];
  summary: string;
  provider: string;
}> {
  const { source, language, errorNodes, stderr, tier = "fast" } = options;

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildErrorFixPrompt(source, errorNodes, language, stderr);

  const { result, provider } = await router.executeWithFailover(async (provider) => {
    const response = await generateObject({
      model: provider.model,
      system: systemPrompt,
      prompt: userPrompt,
      schema: NodeMutationSchema,
    });
    return response.object;
  }, "code", tier);

  return {
    mutations: result.mutations,
    summary: result.summary,
    provider: provider.name,
  };
}

/**
 * Generate mutations specifically for fixing test failures.
 * Includes stderr context to guide the LLM toward the root cause.
 */
export async function generateTestFixMutations(options: {
  source: string;
  language: SupportedLanguage;
  filePath: string;
  stderr: string;
  previousAttempts?: string[];
}): Promise<{
  mutations: NodeMutation[];
  summary: string;
  provider: string;
}> {
  const { source, language, stderr, previousAttempts = [] } = options;

  let additionalContext = "";
  if (previousAttempts.length > 0) {
    additionalContext = `\n\nPREVIOUS FIX ATTEMPTS THAT FAILED:\n` +
      previousAttempts.map((a, i) => `Attempt ${i + 1}: ${a}`).join("\n") +
      `\n\nDo NOT repeat these failed approaches. Try a fundamentally different fix.`;
  }

  const systemPrompt = buildSystemPrompt() + additionalContext;
  const userPrompt = buildErrorFixPrompt(source, [], language, stderr);

  const { result, provider } = await router.executeWithFailover(async (provider) => {
    const response = await generateObject({
      model: provider.model,
      system: systemPrompt,
      prompt: userPrompt,
      schema: NodeMutationSchema,
    });
    return response.object;
  }, "code", "deep"); // Always use deep tier for test fixes

  return {
    mutations: result.mutations,
    summary: result.summary,
    provider: provider.name,
  };
}
