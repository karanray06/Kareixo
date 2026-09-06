/**
 * Stack trace parser — extracts file paths and line numbers from stack traces.
 * Currently supports Node.js/JS/TS format. Extensible for other formats.
 */

export type StackFrame = {
  filePath: string;
  lineNumber: number;
  column?: number;
  functionName?: string;
  raw: string;
};

/**
 * Parse a stack trace string into structured frames.
 * Handles common Node.js/JavaScript/TypeScript formats:
 * - `at functionName (file:line:col)`
 * - `at file:line:col`
 * - `file:line:col` (bare)
 * - `at Object.<anonymous> (/path/to/file.js:10:5)`
 */
export function parseStackTrace(stackTrace: string): StackFrame[] {
  const frames: StackFrame[] = [];
  const lines = stackTrace.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Pattern 1: at functionName (filePath:line:col)
    const atWithParens = trimmed.match(
      /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/
    );
    if (atWithParens) {
      const filePath = cleanFilePath(atWithParens[2]);
      if (isProjectFile(filePath)) {
        frames.push({
          functionName: atWithParens[1],
          filePath,
          lineNumber: parseInt(atWithParens[3], 10),
          column: parseInt(atWithParens[4], 10),
          raw: trimmed,
        });
      }
      continue;
    }

    // Pattern 2: at filePath:line:col (no parens)
    const atWithout = trimmed.match(
      /at\s+(.+?):(\d+):(\d+)/
    );
    if (atWithout) {
      const filePath = cleanFilePath(atWithout[1]);
      if (isProjectFile(filePath)) {
        frames.push({
          filePath,
          lineNumber: parseInt(atWithout[2], 10),
          column: parseInt(atWithout[3], 10),
          raw: trimmed,
        });
      }
      continue;
    }

    // Pattern 3: bare filePath:line:col (common in build errors)
    const bare = trimmed.match(
      /^(.+?\.[a-zA-Z]{1,5}):(\d+):(\d+)/
    );
    if (bare) {
      const filePath = cleanFilePath(bare[1]);
      if (isProjectFile(filePath)) {
        frames.push({
          filePath,
          lineNumber: parseInt(bare[2], 10),
          column: parseInt(bare[3], 10),
          raw: trimmed,
        });
      }
      continue;
    }

    // Pattern 4: Python-style "File "path", line N"
    const pythonStyle = trimmed.match(
      /File\s+"(.+?)",\s+line\s+(\d+)/
    );
    if (pythonStyle) {
      const filePath = cleanFilePath(pythonStyle[1]);
      if (isProjectFile(filePath)) {
        frames.push({
          filePath,
          lineNumber: parseInt(pythonStyle[2], 10),
          raw: trimmed,
        });
      }
    }
  }

  return frames;
}

/** Clean up a file path — strip node internals, webpack loaders, etc. */
function cleanFilePath(raw: string): string {
  let path = raw.trim();
  // Remove webpack loader prefixes like "webpack:///./src/..."
  path = path.replace(/^webpack:\/\/\/\.\//, "");
  // Remove file:// prefix
  path = path.replace(/^file:\/\//, "");
  // Remove leading ./ 
  path = path.replace(/^\.\//, "");
  return path;
}

/** Filter out node_modules, node internals, etc. */
function isProjectFile(filePath: string): boolean {
  if (!filePath) return false;
  if (filePath.includes("node_modules")) return false;
  if (filePath.startsWith("node:")) return false;
  if (filePath.startsWith("internal/")) return false;
  if (filePath.includes("<anonymous>")) return false;
  // Must look like a file path (has extension)
  if (!/\.[a-zA-Z]{1,5}$/.test(filePath.split(":")[0])) return false;
  return true;
}
