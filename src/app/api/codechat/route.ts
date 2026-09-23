import { streamText, tool } from "ai";
import { z } from "zod";
import { router } from "@/lib/model-router";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { repositories, github_installations, chatConversations, chatMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getInstallationOctokit } from "@/lib/github-app";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const maxDuration = 60;

/* ─────────────────────────────────────────────────────────────
 *  CRITICAL FIX #1: Message Sanitization for NVIDIA NIM
 *
 *  The Vercel AI SDK's UIMessage format contains fields that
 *  NVIDIA NIM's OpenAI-compat layer does NOT understand:
 *    - `parts` arrays, `reasoning` objects, `id`, `createdAt`
 *    - nested tool_call metadata with non-standard shapes
 *
 *  We must convert UIMessages → strict OpenAI ChatCompletionMessage[]
 *  while PRESERVING the tool_calls / tool role messages that the
 *  SDK's multi-turn loop depends on.
 * ───────────────────────────────────────────────────────────── */

type SanitizedMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
};

function sanitizeMessages(rawMessages: any[]): SanitizedMessage[] {
  const sanitized: SanitizedMessage[] = [];

  for (const msg of rawMessages) {
    if (!msg || !msg.role) continue;

    // ── Handle tool-result messages (role: "tool") ──
    if (msg.role === "tool") {
      sanitized.push({
        role: "tool",
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? ""),
        tool_call_id: msg.tool_call_id || msg.toolCallId || "unknown",
      });
      continue;
    }

    // ── Handle UIMessage with `parts` array (Vercel AI SDK v4+) ──
    if (msg.parts && Array.isArray(msg.parts)) {
      // Extract text content
      const textParts = msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text || "")
        .join("");

      // Extract tool invocations from parts
      const toolInvocations = msg.parts.filter(
        (p: any) => p.type === "tool-invocation"
      );

      if (msg.role === "assistant" && toolInvocations.length > 0) {
        // Build the assistant message with tool_calls
        const toolCalls = toolInvocations
          .filter((tc: any) => tc.toolName && tc.args)
          .map((tc: any) => ({
            id: tc.toolCallId || tc.id || `call_${Math.random().toString(36).slice(2, 10)}`,
            type: "function" as const,
            function: {
              name: tc.toolName,
              arguments: typeof tc.args === "string" ? tc.args : JSON.stringify(tc.args ?? {}),
            },
          }));

        if (toolCalls.length > 0) {
          sanitized.push({
            role: "assistant",
            content: textParts || "",
            tool_calls: toolCalls,
          });

          // Now emit the tool-result messages for each completed invocation
          for (const tc of toolInvocations) {
            if (tc.state === "result" && tc.result !== undefined) {
              const resultStr = typeof tc.result === "string"
                ? tc.result
                : JSON.stringify(tc.result);
              sanitized.push({
                role: "tool",
                content: truncateToolResult(resultStr, 10000),
                tool_call_id: tc.toolCallId || tc.id || "unknown",
              });
            }
          }
          continue;
        }
      }

      // Plain text message (user or assistant without tool calls)
      if (textParts.trim() || msg.role === "user") {
        sanitized.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: textParts || "",
        });
      }
      continue;
    }

    // ── Handle legacy simple {role, content} messages ──
    if (msg.role === "user" || msg.role === "assistant") {
      const content = typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content ?? "");
      if (content.trim() || msg.role === "user") {
        sanitized.push({ role: msg.role, content });
      }
    }
  }

  // Final safety: ensure messages array is never empty and starts correctly
  if (sanitized.length === 0) {
    sanitized.push({ role: "user", content: "Hello" });
  }

  // Remove any consecutive duplicate roles that NIM might reject
  return sanitized.filter((msg, i) => {
    // Remove empty assistant messages unless they have tool_calls
    if (msg.role === "assistant" && !msg.content?.trim() && !msg.tool_calls?.length) {
      return false;
    }
    return true;
  });
}

/* ─────────────────────────────────────────────────────────────
 *  CRITICAL FIX #3: Aggressive Tool Result Truncation
 *
 *  NVIDIA NIM has strict context/payload limits. A single
 *  large directory listing or file can blow the budget and
 *  cause a 400 or 413 error, crashing the entire stream.
 * ───────────────────────────────────────────────────────────── */

function truncateToolResult(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "\n...[TRUNCATED]";
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    if (!userId) {
      if (process.env.NODE_ENV === "development") {
        userId = "mock-user-id";
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Per-user rate limiting: 30 requests per minute
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const { messages: rawMessages, repoFullName, branch, conversationId, provider: selectedProvider } = await req.json();

    // ── Sanitize messages for NVIDIA NIM compatibility ──
    const messages = sanitizeMessages(rawMessages || []);

    // Build tools if we have repo context
    const tools: Record<string, any> = {};
    const db = getDb();
    
    let finalConversationId = conversationId;
    if (!finalConversationId && messages.length > 0) {
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = (firstUserMsg?.content || "New Conversation").slice(0, 40);
      try {
        const [newConv] = await db.insert(chatConversations).values({
          userId: userId,
          repoFullName: repoFullName || null,
          branch: branch || null,
          title,
        }).returning();
        finalConversationId = newConv.id;
      } catch (err) {
        console.error("Failed to create conversation:", err);
      }
    }
    
    if (repoFullName) {
      const [owner, repo] = repoFullName.split("/");
      
      // Find the installation for this repo to get an authenticated Octokit
      const [repoRecord] = await db.select({ repo: repositories, inst: github_installations })
        .from(repositories)
        .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
        .where(
          and(
            eq(repositories.fullName, repoFullName),
            eq(github_installations.userId, userId)
          )
        );

      if (repoRecord) {
        const octokit = await getInstallationOctokit(repoRecord.inst.installationId);
        const targetRef = branch || "HEAD";

        // NOTE: must be "inputSchema", not "parameters" — ai@7 requirement, has regressed before
        // Tool: Read a specific file from the repo
        tools.readFile = tool({
          description: "Read a file from the repository. Use this to examine source code when you need to see the actual implementation.",
          inputSchema: z.object({
            path: z.string().describe("The file path relative to the repo root, e.g. 'src/lib/utils.ts'"),
          }).describe("The schema for reading a file"),
          execute: async ({ path: filePath }) => {
            // CRITICAL FIX #4: Error catching inside tool execution
            try {
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: targetRef,
              });
              if (Array.isArray(data) || data.type !== "file") {
                return `'${filePath}' is a directory, not a file. Use listDirectory instead.`;
              }
              const content = Buffer.from(data.content, "base64").toString("utf-8");
              // FIX #3: Aggressive truncation to prevent payload overflow
              const truncated = truncateToolResult(content, 12000);
              return `File: ${filePath}\n\n${truncated}`;
            } catch (err: any) {
              // FIX #4: Return error as string, don't throw
              return `Error reading '${filePath}': ${err?.message || "Unknown error"}`;
            }
          },
        });

        // NOTE: must be "inputSchema", not "parameters" — ai@7 requirement, has regressed before
        // Tool: List directory contents
        tools.listDirectory = tool({
          description: "List the contents of a directory in the repository. Use this to explore the file structure.",
          inputSchema: z.object({
            path: z.string().describe("The directory path relative to repo root, e.g. 'src/lib' or '' for root"),
          }).describe("The schema for listing a directory"),
          execute: async ({ path: dirPath }) => {
            // CRITICAL FIX #4: Error catching inside tool execution
            try {
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: dirPath || "",
                ref: targetRef,
              });
              if (!Array.isArray(data)) {
                return `'${dirPath}' is a file, not a directory. Use readFile instead.`;
              }
              const listing = data.map((item: any) =>
                `${item.type === "dir" ? "📁" : "📄"} ${item.name} (${item.type}, ${item.size || 0}b)`
              ).join("\n");
              // FIX #3: Aggressive truncation for directory listings
              return truncateToolResult(`Directory: ${dirPath || "/"}\n\n${listing}`, 8000);
            } catch (err: any) {
              // FIX #4: Return error as string, don't throw
              return `Error listing '${dirPath}': ${err?.message || "Unknown error"}`;
            }
          },
        });

        // NOTE: must be "inputSchema", not "parameters" — ai@7 requirement, has regressed before
        // Tool: Search for code in the repo
        tools.searchCode = tool({
          description: "Search for code in the repository using GitHub's code search.",
          inputSchema: z.object({
            query: z.string().describe("The search query, e.g. 'function handleSubmit' or 'import router'"),
          }).describe("The schema for searching code"),
          execute: async ({ query }) => {
            try {
              const { data } = await octokit.rest.search.code({
                q: `${query} repo:${repoFullName}`,
                per_page: 10,
              });
              if (data.total_count === 0) {
                return `No results found for "${query}" in ${repoFullName}.`;
              }
              const results = data.items.map((item: any) =>
                `📄 ${item.path} — ${item.html_url}`
              ).join("\n");
              return truncateToolResult(`Found ${data.total_count} results for "${query}":\n\n${results}`, 6000);
            } catch (err: any) {
              return `Search failed: ${err?.message || "Unknown error"}`;
            }
          },
        });

        // NOTE: must be "inputSchema", not "parameters" — ai@7 requirement, has regressed before
        // Tool: Propose a code change (read-only — does NOT write to GitHub)
        tools.proposeChange = tool({
          description:
            "Propose a code change to a file in the repository. Read the current file, then return the modified version. " +
            "The user will see a diff and can approve/discard. Use this when the user asks you to fix, refactor, or modify code.",
          inputSchema: z.object({
            path: z.string().describe("The file path relative to the repo root, e.g. 'src/lib/utils.ts'"),
            newContent: z.string().describe("The complete new file content after your changes"),
            explanation: z.string().describe("A brief explanation of what the change does and why"),
          }).describe("The schema for proposing a code change"),
          execute: async ({ path: filePath, newContent, explanation }) => {
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
        });
      }
    }

    // Build system prompt
    let baseSystemPrompt = `You are Kareixo CodeChat — an expert AI coding assistant. You help developers understand, debug, and improve their code.`;
    
    if (repoFullName) {
      baseSystemPrompt += `\n\nYou are working with the repository: ${repoFullName}`;
      if (branch) baseSystemPrompt += ` (branch: ${branch})`;
    }

    const hasTools = Object.keys(tools).length > 0;

    const initialTier = selectedProvider === "NVIDIA_NIM_KIMI" ? "deep" : selectedProvider === "GROQ" ? "fallback" : "fast";

    const { result, provider } = await router.executeWithFailover(async (p) => {
      // All current providers (NVIDIA NIM + Groq) support tool calling (conditionally based on router)
      const supportsTools = hasTools && p.provider.supportsTools && !p.disableTools;
      
      let systemPrompt = baseSystemPrompt;
      if (repoFullName && supportsTools) {
        systemPrompt += `\n\nYou have access to tools to read files, explore the repository structure, search code, and propose code changes. Use them when you need to see actual code — don't guess at implementations.`;
        systemPrompt += `\n\nWhen the user asks about code or the repo, ALWAYS call the appropriate tool first. Start by listing the root directory to understand the project structure, then read specific files as needed.`;
        systemPrompt += `\n\nWhen the user asks you to fix, refactor, or modify code, use the proposeChange tool to propose the change. Always read the file first, then propose the full modified file content. The user will see a diff and can approve or discard.`;
        systemPrompt += `\n\nIMPORTANT: After receiving tool results, ALWAYS provide a final text response summarizing what you found. Never leave the user without a text answer.`;
      }

      try {
        /* ─────────────────────────────────────────────────────
         *  CRITICAL FIX #2: Enable maxSteps for Multi-Turn Loop
         *
         *  Without maxSteps, the SDK calls the tool once and
         *  returns the tool_call as the "final" response — it
         *  never feeds the result back to the LLM for synthesis.
         *
         *  maxSteps: 8 allows: call tool → read result →
         *  call another tool → read result → ... → final answer
         * ───────────────────────────────────────────────────── */
        const res = streamText({
          model: p.provider.model,
          system: systemPrompt,
          messages: messages as any,
          ...(supportsTools ? { tools, maxSteps: 8, toolChoice: "auto" } : {}),
          ...(p.provider.name === "GROQ" ? {
            providerOptions: {
              groq: { reasoningFormat: "hidden" },
            },
          } : {}),
          onFinish: async (event) => {
            if (finalConversationId) {
              try {
                const lastUserMsg = rawMessages[rawMessages.length - 1];
                
                if (lastUserMsg) {
                  // Determine content based on format
                  let userContent = "";
                  if (typeof lastUserMsg.content === "string") userContent = lastUserMsg.content;
                  else if (Array.isArray(lastUserMsg.parts)) {
                    userContent = lastUserMsg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("");
                  }

                  await db.insert(chatMessages).values({
                    conversationId: finalConversationId,
                    role: "user",
                    content: userContent,
                  });
                }

                await db.insert(chatMessages).values({
                  conversationId: finalConversationId,
                  role: "assistant",
                  content: event.text || "",
                  model: provider.modelId,
                });

                await db.update(chatConversations)
                  .set({ updatedAt: new Date() })
                  .where(eq(chatConversations.id, finalConversationId));
              } catch (err) {
                console.error("[CodeChat persistence error]:", err);
              }
            }

            if (event.finishReason !== "stop" && event.finishReason !== "tool-calls") {
              console.log(`[CodeChat] Stream finished with reason: ${event.finishReason}`);
            }
          },
        });

        return res;
      } catch (error) {
        console.error("StreamText Error:", error);
        throw error;
      }
    }, "chat", initialTier);

    return result.toUIMessageStreamResponse({
      headers: {
        "x-ai-provider": provider.name,
        ...(finalConversationId ? { "X-Conversation-Id": finalConversationId } : {}),
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
