/**
 * Postinstall script: copy tree-sitter WASM grammars to public/grammars/
 * so they're accessible at runtime on Vercel and locally.
 */
const fs = require("fs");
const path = require("path");

const GRAMMARS_DIR = path.join(__dirname, "..", "public", "grammars");
const WASMS_DIR = path.join(__dirname, "..", "node_modules", "tree-sitter-wasms", "out");
const TS_WASM = path.join(__dirname, "..", "node_modules", "web-tree-sitter", "web-tree-sitter.wasm");

const GRAMMAR_FILES = [
  "tree-sitter-javascript.wasm",
  "tree-sitter-typescript.wasm",
];

// Create target directory
if (!fs.existsSync(GRAMMARS_DIR)) {
  fs.mkdirSync(GRAMMARS_DIR, { recursive: true });
}

// Copy core runtime
if (fs.existsSync(TS_WASM)) {
  fs.copyFileSync(TS_WASM, path.join(GRAMMARS_DIR, "web-tree-sitter.wasm"));
  console.log("✅ Copied tree-sitter.wasm");
} else {
  console.warn("⚠️ tree-sitter.wasm not found at", TS_WASM);
}

// Copy grammar files
for (const file of GRAMMAR_FILES) {
  const src = path.join(WASMS_DIR, file);
  const dest = path.join(GRAMMARS_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  } else {
    console.warn(`⚠️ ${file} not found at ${src}`);
  }
}

console.log("✅ Grammar setup complete");
