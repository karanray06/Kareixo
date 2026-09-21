/**
 * AST Parser Service — Tree-sitter WASM integration for server-side code parsing.
 *
 * Uses web-tree-sitter with pre-built WASM grammars for JavaScript and TypeScript.
 * Provides a singleton parser instance with lazy initialization.
 */
import { Parser, Language, Tree, Node as SyntaxNode, Query } from "web-tree-sitter";
import path from "path";
import fs from "fs";

export type SupportedLanguage = "javascript" | "typescript" | "tsx" | "jsx";

export interface ASTNode {
  /** Tree-sitter node type (e.g. "call_expression", "ERROR") */
  type: string;
  /** The source text of this node */
  text: string;
  /** Byte offset start in the source */
  startIndex: number;
  /** Byte offset end in the source */
  endIndex: number;
  /** Row/column start position */
  startPosition: { row: number; column: number };
  /** Row/column end position */
  endPosition: { row: number; column: number };
  /** The parent node's type */
  parentType: string | null;
  /** Summary of child node types */
  children: string[];
  /** Whether this node represents a syntax error */
  isError: boolean;
  /** Whether this node is missing (expected but not found) */
  isMissing: boolean;
}

// ── Singleton state ──
let parserInitialized = false;
const languageCache = new Map<string, Language>();

/**
 * Resolve the path to a grammar WASM file.
 * Checks public/grammars/ first (for production), then falls back to node_modules.
 */
function resolveGrammarPath(grammarName: string): string {
  // Try public/grammars/ first (Vercel deployment)
  const publicPath = path.join(process.cwd(), "public", "grammars", `${grammarName}.wasm`);
  if (fs.existsSync(publicPath)) return publicPath;

  // Fallback: node_modules/tree-sitter-wasms
  const nmPath = path.join(
    process.cwd(),
    "node_modules",
    "tree-sitter-wasms",
    "out",
    `${grammarName}.wasm`
  );
  if (fs.existsSync(nmPath)) return nmPath;

  throw new Error(
    `[AST Parser] Grammar file not found for "${grammarName}". ` +
    `Checked: ${publicPath} and ${nmPath}`
  );
}

/**
 * Map our language identifiers to tree-sitter grammar names.
 */
function getGrammarName(language: SupportedLanguage): string {
  switch (language) {
    case "javascript":
    case "jsx":
      return "tree-sitter-javascript";
    case "typescript":
    case "tsx":
      return "tree-sitter-typescript";
    default:
      return "tree-sitter-javascript";
  }
}

/**
 * Initialize the tree-sitter WASM runtime (only once).
 */
async function ensureInitialized(): Promise<void> {
  if (parserInitialized) return;

  // Locate the tree-sitter.wasm core runtime
  const wasmPath = resolveTreeSitterWasm();

  await Parser.init({
    locateFile: () => wasmPath,
  });

  parserInitialized = true;
}

function resolveTreeSitterWasm(): string {
  // Check public/grammars/
  const publicPath = path.join(process.cwd(), "public", "grammars", "web-tree-sitter.wasm");
  if (fs.existsSync(publicPath)) return publicPath;

  // Check node_modules/web-tree-sitter/
  const nmPath = path.join(
    process.cwd(),
    "node_modules",
    "web-tree-sitter",
    "web-tree-sitter.wasm"
  );
  if (fs.existsSync(nmPath)) return nmPath;

  throw new Error("[AST Parser] tree-sitter.wasm not found");
}

/**
 * Load a language grammar (cached).
 */
async function loadLanguage(language: SupportedLanguage): Promise<Language> {
  const grammarName = getGrammarName(language);

  if (languageCache.has(grammarName)) {
    return languageCache.get(grammarName)!;
  }

  const grammarPath = resolveGrammarPath(grammarName);
  const lang = await Language.load(grammarPath);
  languageCache.set(grammarName, lang);

  return lang;
}

/**
 * Parse source code into a Tree-sitter syntax tree.
 */
export async function parseCode(
  source: string,
  language: SupportedLanguage
): Promise<Tree> {
  await ensureInitialized();

  const parser = new Parser();
  const lang = await loadLanguage(language);
  parser.setLanguage(lang);

  const tree = parser.parse(source);
  if (!tree) {
    throw new Error(`[AST Parser] Failed to parse source (${language})`);
  }
  return tree;
}

/**
 * Extract all ERROR and MISSING nodes from a syntax tree.
 * These represent syntax errors that need fixing.
 */
export function findErrorNodes(tree: Tree): ASTNode[] {
  const errors: ASTNode[] = [];
  const cursor = tree.walk();

  function visit(): void {
    const node = cursor.currentNode;

    if (node.type === "ERROR" || node.isMissing) {
      errors.push(nodeToASTNode(node));
    }

    if (cursor.gotoFirstChild()) {
      do {
        visit();
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }
  }

  visit();
  return errors;
}

/**
 * Find nodes matching a Tree-sitter S-expression query.
 *
 * Example queries:
 *   - `(call_expression function: (identifier) @fn (#eq? @fn "eval"))` — find eval() calls
 *   - `(ERROR) @error` — find all error nodes
 */
export async function queryNodes(
  tree: Tree,
  queryString: string,
  language: SupportedLanguage
): Promise<ASTNode[]> {
  await ensureInitialized();
  const lang = await loadLanguage(language);
  const query = new Query(lang, queryString);

  const matches = query.matches(tree.rootNode);
  const results: ASTNode[] = [];

  for (const match of matches) {
    for (const capture of match.captures) {
      results.push(nodeToASTNode(capture.node));
    }
  }

  return results;
}

/**
 * Get context around a specific line range — useful for giving the LLM
 * enough surrounding code to understand the issue.
 */
export function getNodeContext(
  source: string,
  startLine: number,
  endLine: number,
  contextLines: number = 5
): { contextCode: string; contextStartLine: number; contextEndLine: number } {
  const lines = source.split("\n");
  const contextStartLine = Math.max(0, startLine - contextLines);
  const contextEndLine = Math.min(lines.length - 1, endLine + contextLines);
  const contextCode = lines.slice(contextStartLine, contextEndLine + 1).join("\n");

  return { contextCode, contextStartLine, contextEndLine };
}

/**
 * Detect the language from a file path.
 */
export function detectLanguage(filePath: string): SupportedLanguage {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts": return "typescript";
    case ".tsx": return "tsx";
    case ".jsx": return "jsx";
    case ".js":
    case ".mjs":
    case ".cjs":
    default:
      return "javascript";
  }
}

/**
 * Check if a source string has any syntax errors.
 */
export async function hasSyntaxErrors(
  source: string,
  language: SupportedLanguage
): Promise<boolean> {
  const tree = await parseCode(source, language);
  const errors = findErrorNodes(tree);
  return errors.length > 0;
}

// ── Internal helpers ──

function nodeToASTNode(node: SyntaxNode): ASTNode {
  return {
    type: node.type,
    text: node.text.length > 500 ? node.text.slice(0, 500) + "..." : node.text,
    startIndex: node.startIndex,
    endIndex: node.endIndex,
    startPosition: { row: node.startPosition.row, column: node.startPosition.column },
    endPosition: { row: node.endPosition.row, column: node.endPosition.column },
    parentType: node.parent?.type ?? null,
    children: node.children.map((c) => c.type),
    isError: node.type === "ERROR",
    isMissing: node.isMissing,
  };
}
