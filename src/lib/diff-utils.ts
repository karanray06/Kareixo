/**
 * Lightweight line-diff utility.
 * Computes a unified diff between two text strings using a basic LCS algorithm.
 * No external dependencies required.
 */

export type DiffLine = {
  type: "add" | "remove" | "same";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
};

/**
 * Compute the Longest Common Subsequence table for two arrays of strings.
 */
function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Compute a line-by-line diff between two text strings.
 * Returns an array of DiffLine objects with type, content, and line numbers.
 */
export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const dp = lcsTable(oldLines, newLines);
  const result: DiffLine[] = [];

  let i = oldLines.length;
  let j = newLines.length;

  // Backtrack through the LCS table to build the diff
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({
        type: "same",
        content: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: "add",
        content: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else {
      stack.push({
        type: "remove",
        content: oldLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  // Reverse since we built it backwards
  for (let k = stack.length - 1; k >= 0; k--) {
    result.push(stack[k]);
  }

  return result;
}

/**
 * Format a DiffLine array as a unified diff string (for display purposes).
 */
export function formatUnifiedDiff(
  diff: DiffLine[],
  filePath: string
): string {
  const lines: string[] = [];
  lines.push(`--- a/${filePath}`);
  lines.push(`+++ b/${filePath}`);

  for (const line of diff) {
    switch (line.type) {
      case "add":
        lines.push(`+${line.content}`);
        break;
      case "remove":
        lines.push(`-${line.content}`);
        break;
      case "same":
        lines.push(` ${line.content}`);
        break;
    }
  }

  return lines.join("\n");
}
