import { streamText } from "ai";
import { z } from "zod";
import { router } from "@/lib/model-router";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getInstallationOctokit } from "@/lib/github-app";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limiting: 30 requests per minute
    const rateCheck = checkRateLimit(session.user.id);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const { messages: rawMessages, repoFullName, branch } = await req.json();

    // Convert UIMessage format to simple format
    const messages = (rawMessages || []).map((msg: any) => {
      if (msg.content) {
        return { role: msg.role, content: msg.content };
      }
      if (msg.parts && Array.isArray(msg.parts)) {
        const text = msg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text || "")
          .join("");
        return { role: msg.role, content: text };
      }
      return { role: msg.role, content: "" };
    });

    // Build tools if we have repo context
    const tools: Record<string, any> = {};
    
    if (repoFullName) {
      const db = getDb();
      const [owner, repo] = repoFullName.split("/");
      
      // Find the installation for this repo to get an authenticated Octokit
      const [repoRecord] = await db.select({ repo: repositories, inst: github_installations })
        .from(repositories)
        .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
        .where(
          and(
            eq(repositories.fullName, repoFullName),
            eq(github_installations.userId, session.user.id)
          )
        );

      if (repoRecord) {
        const octokit = await getInstallationOctokit(repoRecord.inst.installationId);
        const targetRef = branch || "HEAD";

        // Tool: Read a specific file from the repo
        tools.readFile = {
          description: "Read a file from the repository. Use this to examine source code when you need to see the actual implementation.",
          inputSchema: z.object({
            path: z.string().describe("The file path relative to the repo root, e.g. 'src/lib/utils.ts'"),
          }),
          execute: async ({ path: filePath }: { path: string }) => {
            try {
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: targetRef,
              });
              if (Array.isArray(data) || data.type !== "file") {
                return { error: `'${filePath}' is a directory, not a file.` };
              }
              const content = Buffer.from(data.content, "base64").toString("utf-8");
              if (content.length > 50000) {
                return { 
                  content: content.slice(0, 50000) + "\n\n... [truncated — file too large]",
                  truncated: true,
                  totalSize: content.length,
                };
              }
              return { content, path: filePath, sha: data.sha };
            } catch (err: any) {
              return { error: `Failed to read '${filePath}': ${err?.message}` };
            }
          },
        };

        // Tool: List directory contents
        tools.listDirectory = {
          description: "List the contents of a directory in the repository. Use this to explore the file structure.",
          inputSchema: z.object({
            path: z.string().describe("The directory path relative to repo root, e.g. 'src/lib' or '' for root").default(""),
          }),
          execute: async ({ path: dirPath }: { path: string }) => {
            try {
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: dirPath || "",
                ref: targetRef,
              });
              if (!Array.isArray(data)) {
                return { error: `'${dirPath}' is a file, not a directory.` };
              }
              return {
                path: dirPath || "/",
                entries: data.map((item: any) => ({
                  name: item.name,
                  type: item.type,
                  size: item.size,
                  path: item.path,
                })),
              };
            } catch (err: any) {
              return { error: `Failed to list '${dirPath}': ${err?.message}` };
            }
          },
        };

        // Tool: Search for code in the repo
        tools.searchCode = {
          description: "Search for code in the repository using GitHub's code search.",
          inputSchema: z.object({
            query: z.string().describe("The search query, e.g. 'function handleSubmit' or 'import router'"),
          }),
          execute: async ({ query }: { query: string }) => {
            try {
              const { data } = await octokit.rest.search.code({
                q: `${query} repo:${repoFullName}`,
                per_page: 10,
              });
              return {
                totalCount: data.total_count,
                results: data.items.map((item: any) => ({
                  path: item.path,
                  name: item.name,
                  htmlUrl: item.html_url,
                })),
              };
            } catch (err: any) {
              return { error: `Search failed: ${err?.message}` };
            }
          },
        };

        // Tool: Propose a code change (read-only — does NOT write to GitHub)
        tools.proposeChange = {
          description:
            "Propose a code change to a file in the repository. Read the current file, then return the modified version. " +
            "The user will see a diff and can approve/discard. Use this when the user asks you to fix, refactor, or modify code.",
          inputSchema: z.object({
            path: z.string().describe("The file path relative to the repo root, e.g. 'src/lib/utils.ts'"),
            newContent: z.string().describe("The complete new file content after your changes"),
            explanation: z.string().describe("A brief explanation of what the change does and why"),
          }),
          execute: async ({
            path: filePath,
            newContent,
            explanation,
          }: {
            path: string;
            newContent: string;
            explanation: string;
          }) => {
            try {
              // Read the current file to get oldContent and SHA
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: targetRef,
              });
              if (Array.isArray(data) || data.type !== "file") {
                return { error: `'${filePath}' is a directory, not a file.` };
              }
              const oldContent = Buffer.from(data.content, "base64").toString("utf-8");

              return {
                type: "propose_change",
                path: filePath,
                oldContent,
                newContent,
                sha: data.sha,
                explanation,
                repoFullName,
              };
            } catch (err: any) {
              if (err?.status === 404) {
                // New file — no old content
                return {
                  type: "propose_change",
                  path: filePath,
                  oldContent: "",
                  newContent,
                  sha: null,
                  explanation,
                  repoFullName,
                };
              }
              return { error: `Failed to read '${filePath}': ${err?.message}` };
            }
          },
        };
      }
    }

    // Build system prompt
    let systemPrompt = `You are Kareixo CodeChat — an expert AI coding assistant. You help developers understand, debug, and improve their code.`;
    
    if (repoFullName) {
      systemPrompt += `\n\nYou are working with the repository: ${repoFullName}`;
      if (branch) systemPrompt += ` (branch: ${branch})`;
      systemPrompt += `\n\nYou have access to tools to read files, explore the repository structure, and propose code changes. Use them when you need to see actual code — don't guess at implementations.`;
      systemPrompt += `\n\nWhen the user asks about code, always read the relevant file(s) first before answering.`;
      systemPrompt += `\n\nWhen the user asks you to fix, refactor, or modify code, use the proposeChange tool to propose the change. Always read the file first, then propose the full modified file content. The user will see a diff and can approve or discard.`;
    }

    const hasTools = Object.keys(tools).length > 0;

    // Execute with multi-key failover
    const { result, provider } = await router.executeWithFailover(async (p) => {
      const res = streamText({
        model: p.model,
        system: systemPrompt,
        messages,
        ...(hasTools ? { tools, maxSteps: 5 } : {}),
      });

      // Probe the stream for immediate failures
      const reader = res.fullStream.getReader();
      const buffered: any[] = [];
      let streamError: any = null;

      for (let i = 0; i < 2; i++) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value.type === "error") {
          streamError = value.error;
          break;
        }
        buffered.push(value);
      }

      if (streamError) {
        throw streamError;
      }

      const customFullStream = new ReadableStream({
        start(controller) {
          for (const chunk of buffered) controller.enqueue(chunk);
        },
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) controller.close();
          else controller.enqueue(value);
        },
        cancel() { reader.cancel(); },
      });

      Object.defineProperty(res, "fullStream", { value: customFullStream, configurable: true });
      return res;
    }, "code", "deep");

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelName,
      },
    });

  } catch (error: any) {
    console.error("CodeChat API error:", error);
    return NextResponse.json(
      { error: error.message || "CodeChat service unavailable. Please try again." },
      { status: 503 }
    );
  }
}
