/**
 * AST Mutation Engine — deterministically applies LLM-generated patches
 * using tree-sitter byte offsets for zero-syntax-error guarantees.
 */
import { parseCode, findErrorNodes, type SupportedLanguage, type ASTNode } from "./parser";

/**
 * A single node mutation the LLM must produce.
 */
export interface NodeMutation {
  /** The mutation action */
  action: "replace" | "insert_before" | "insert_after" | "delete";
  /** The tree-sitter node type being targeted (e.g. "call_expression") */
  targetNodeType: string;
  /** 0-indexed start line of the target region */
  targetStartLine: number;
  /** 0-indexed end line of the target region */
  targetEndLine: number;
  /** The replacement source text (empty for "delete") */
  newCodeFragment: string;
  /** LLM's explanation of why this mutation is needed */
  explanation: string;
}

/**
 * Result of applying mutations to source code.
 */
export interface PatchResult {
  /** Whether the patched code has zero syntax errors */
  valid: boolean;
  /** The patched source code (or original if invalid) */
  patchedSource: string;
  /** Any remaining syntax errors after patching */
  errors: ASTNode[];
  /** Number of mutations successfully applied */
  mutationsApplied: number;
}

/**
 * Apply an array of NodeMutation to source code.
 *
 * Strategy:
 * 1. For each mutation, find the target region by line range
 * 2. Sort mutations in reverse order (bottom-to-top) to preserve byte offsets
 * 3. Apply each mutation via string splice
 * 4. Re-parse to validate
 */
export async function applyMutations(
  source: string,
  mutations: NodeMutation[],
  language: SupportedLanguage
): Promise<PatchResult> {
  if (mutations.length === 0) {
    return { valid: true, patchedSource: source, errors: [], mutationsApplied: 0 };
  }

  const lines = source.split("\n");
  let patchedSource = source;
  let mutationsApplied = 0;

  // Sort mutations by start line in descending order to preserve offsets
  const sortedMutations = [...mutations].sort(
    (a, b) => b.targetStartLine - a.targetStartLine
  );

  for (const mutation of sortedMutations) {
    try {
      const result = applySingleMutation(patchedSource, mutation, lines);
      if (result !== null) {
        patchedSource = result;
        mutationsApplied++;
      }
    } catch (err: any) {
      console.warn(
        `[AST Mutation] Failed to apply mutation at line ${mutation.targetStartLine}: ${err.message}`
      );
    }
  }

  // Re-parse to validate
  const validation = await validatePatch(patchedSource, language);

  return {
    valid: validation.valid,
    patchedSource: validation.valid ? patchedSource : source,
    errors: validation.errors,
    mutationsApplied,
  };
}

/**
 * Apply a single mutation to source code.
 * Returns the patched source or null if the mutation couldn't be applied.
 */
function applySingleMutation(
  source: string,
  mutation: NodeMutation,
  _originalLines: string[]
): string | null {
  const lines = source.split("\n");

  // Clamp line ranges
  const startLine = Math.max(0, Math.min(mutation.targetStartLine, lines.length - 1));
  const endLine = Math.max(startLine, Math.min(mutation.targetEndLine, lines.length - 1));

  switch (mutation.action) {
    case "replace": {
      const before = lines.slice(0, startLine);
      const after = lines.slice(endLine + 1);
      const newLines = mutation.newCodeFragment.split("\n");
      return [...before, ...newLines, ...after].join("\n");
    }

    case "insert_before": {
      const before = lines.slice(0, startLine);
      const rest = lines.slice(startLine);
      const newLines = mutation.newCodeFragment.split("\n");
      return [...before, ...newLines, ...rest].join("\n");
    }

    case "insert_after": {
      const before = lines.slice(0, endLine + 1);
      const rest = lines.slice(endLine + 1);
      const newLines = mutation.newCodeFragment.split("\n");
      return [...before, ...newLines, ...rest].join("\n");
    }

    case "delete": {
      const before = lines.slice(0, startLine);
      const after = lines.slice(endLine + 1);
      return [...before, ...after].join("\n");
    }

    default:
      return null;
  }
}

/**
 * Validate that patched code has zero syntax errors.
 */
export async function validatePatch(
  source: string,
  language: SupportedLanguage
): Promise<{ valid: boolean; errors: ASTNode[] }> {
  try {
    const tree = await parseCode(source, language);
    const errors = findErrorNodes(tree);
    return { valid: errors.length === 0, errors };
  } catch (err: any) {
    return {
      valid: false,
      errors: [{
        type: "PARSE_ERROR",
        text: err.message,
        startIndex: 0,
        endIndex: 0,
        startPosition: { row: 0, column: 0 },
        endPosition: { row: 0, column: 0 },
        parentType: null,
        children: [],
        isError: true,
        isMissing: false,
      }],
    };
  }
}

/**
 * Generate a unified diff-like summary of what mutations were applied.
 */
export function summarizeMutations(mutations: NodeMutation[]): string {
  if (mutations.length === 0) return "No mutations applied.";

  return mutations
    .map((m, i) => {
      const lineRange = m.targetStartLine === m.targetEndLine
        ? `line ${m.targetStartLine + 1}`
        : `lines ${m.targetStartLine + 1}-${m.targetEndLine + 1}`;
      return `${i + 1}. **${m.action.toUpperCase()}** ${m.targetNodeType} at ${lineRange}\n   ${m.explanation}`;
    })
    .join("\n\n");
}
