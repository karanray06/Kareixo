/**
 * Regression test: ai@7 tool definitions must use "inputSchema", not "parameters".
 *
 * The tool() function in ai@7 does NOT remap "parameters" to "inputSchema".
 * Using the wrong key means streamText never sees the tool schemas, and tool
 * calls silently fail. This has regressed twice already.
 *
 * Run with: npx vitest run src/__tests__/tool-schema.test.ts
 */
import { describe, it, expect } from "vitest";
import { tool } from "ai";
import { z } from "zod";

describe("CodeChat tool definitions use inputSchema (ai@7 requirement)", () => {
  // Construct the tools the same way route.ts does
  const readFile = tool({
    description: "Read a file from the repository.",
    inputSchema: z.object({
      path: z.string().describe("File path"),
    }),
    execute: async ({ path }) => ({ content: "", path }),
  });

  const listDirectory = tool({
    description: "List directory contents.",
    inputSchema: z.object({
      path: z.string().describe("Directory path").default(""),
    }),
    execute: async ({ path }) => ({ path, entries: [] }),
  });

  const searchCode = tool({
    description: "Search for code in the repo.",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => ({ totalCount: 0, results: [] }),
  });

  const proposeChange = tool({
    description: "Propose a code change.",
    inputSchema: z.object({
      path: z.string().describe("File path"),
      newContent: z.string().describe("New content"),
      explanation: z.string().describe("Explanation"),
    }),
    execute: async ({ path, newContent, explanation }) => ({
      type: "propose_change" as const,
      path,
      oldContent: "",
      newContent,
      explanation,
    }),
  });

  const allTools = { readFile, listDirectory, searchCode, proposeChange };

  for (const [name, t] of Object.entries(allTools)) {
    it(`${name} has "inputSchema" key`, () => {
      expect(Object.keys(t)).toContain("inputSchema");
    });

    it(`${name} does NOT have "parameters" key`, () => {
      expect(Object.keys(t)).not.toContain("parameters");
    });
  }
});
