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
 *  Message Sanitization for NVIDIA NIM
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
      const textParts = msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text || "")
        .join("");

      const toolInvocations = msg.parts.filter(
        (p: any) => p.type === "tool-invocation"
      );

      if (msg.role === "assistant" && toolInvocations.length > 0) {
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

          // Emit the tool-result messages for each completed invocation
          for (const tc of toolInvocations) {
            if (tc.state === "result" && tc.result !== undefined) {
              const resultStr = typeof tc.result === "string"
                ? tc.result
                : JSON.stringify(tc.result);
              sanitized.push({
                role: "tool",
                content: truncate(resultStr, 10000),
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

  if (sanitized.length === 0) {
    sanitized.push({ role: "user", content: "Hello" });
  }

  return sanitized.filter((msg) => {
    if (msg.role === "assistant" && !msg.content?.trim() && !msg.tool_calls?.length) {
      return false;
    }
    return true;
  });
}

/* ── Truncation Helper ── */
function truncate(str: string, maxLen: number): string {
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

    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const { messages: rawMessages, repoFullName, branch, conversationId, provider: selectedProvider } = await req.json();

    const messages = sanitizeMessages(rawMessages || []);

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
        const targetRef = branch || "main";

        /* ═══════════════════════════════════════════
         *  TOOL 1: read_file
         *  Reads a single file and returns its decoded content.
         * ═══════════════════════════════════════════ */
        tools.readFile = tool({
          description: "Read a file from the repository. Returns the decoded UTF-8 file content. Use this when you need to examine source code, configs, or any text file.",
          inputSchema: z.object({
            path: z.string().describe("File path relative to repo root, e.g. 'src/lib/utils.ts' or 'README.md'"),
          }).describe("Parameters for reading a file"),
          execute: async ({ path: filePath }) => {
            try {
              console.log(`[Tool:readFile] Reading ${owner}/${repo}/${filePath} @ ${targetRef}`);
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: targetRef,
              });
              if (Array.isArray(data) || data.type !== "file") {
                return `Error: '${filePath}' is a directory, not a file. Use the listDirectory tool instead.`;
              }
              const content = Buffer.from(data.content, "base64").toString("utf-8");
              const result = truncate(content, 12000);
              console.log(`[Tool:readFile] Success: ${filePath} (${content.length} chars)`);
              return `=== File: ${filePath} ===\n\n${result}`;
            } catch (err: any) {
              console.error(`[Tool:readFile] Error: ${filePath}`, err?.message);
              return `Error: Could not read file '${filePath}' (${err?.message || "Unknown error"})`;
            }
          },
        });

        /* ═══════════════════════════════════════════
         *  TOOL 2: list_directory
         *  Lists the contents of a directory.
         * ═══════════════════════════════════════════ */
        tools.listDirectory = tool({
          description: "List files and subdirectories in a repository directory. Returns name, type (file/dir), and size for each entry. Use '' or '.' for the root directory.",
          inputSchema: z.object({
            path: z.string().describe("Directory path relative to repo root. Use '' or '.' for the root directory."),
          }).describe("Parameters for listing a directory"),
          execute: async ({ path: dirPath }) => {
            try {
              const normalizedPath = (!dirPath || dirPath === ".") ? "" : dirPath;
              console.log(`[Tool:listDirectory] Listing ${owner}/${repo}/${normalizedPath || "/"} @ ${targetRef}`);
              const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: normalizedPath,
                ref: targetRef,
              });
              if (!Array.isArray(data)) {
                return `Error: '${dirPath}' is a file, not a directory. Use the readFile tool instead.`;
              }
              const listing = data.map((item: any) =>
                `${item.type === "dir" ? "📁" : "📄"} ${item.name}  (${item.type}, ${item.size || 0} bytes)`
              ).join("\n");
              console.log(`[Tool:listDirectory] Success: ${data.length} entries`);
              return truncate(`=== Directory: ${normalizedPath || "/"} ===\n\n${listing}`, 8000);
            } catch (err: any) {
              console.error(`[Tool:listDirectory] Error: ${dirPath}`, err?.message);
              return `Error: Could not list directory '${dirPath}' (${err?.message || "Unknown error"})`;
            }
          },
        });

        /* ═══════════════════════════════════════════
         *  TOOL 3: search_code
         *  Searches for code patterns across the repo.
         * ═══════════════════════════════════════════ */
        tools.searchCode = tool({
          description: "Search for code in the repository using GitHub's code search. Returns matching file paths.",
          inputSchema: z.object({
            query: z.string().describe("The search query, e.g. 'function handleSubmit' or 'import router'"),
          }).describe("Parameters for searching code"),
          execute: async ({ query }) => {
            try {
              console.log(`[Tool:searchCode] Searching: "${query}" in ${repoFullName}`);
              const { data } = await octokit.rest.search.code({
                q: `${query} repo:${repoFullName}`,
                per_page: 10,
              });
              if (data.total_count === 0) {
                return `No results found for "${query}" in ${repoFullName}.`;
              }
              const results = data.items.map((item: any) =>
                `📄 ${item.path}`
              ).join("\n");
              console.log(`[Tool:searchCode] Found ${data.total_count} results`);
              return truncate(`Found ${data.total_count} results for "${query}":\n\n${results}`, 6000);
            } catch (err: any) {
              console.error(`[Tool:searchCode] Error:`, err?.message);
              return `Error: Search failed (${err?.message || "Unknown error"})`;
            }
          },
        });

        /* ═══════════════════════════════════════════
         *  TOOL 4: update_file (NEW — Commit Changes)
         *  Writes content to a file and commits it.
         * ═══════════════════════════════════════════ */
        tools.updateFile = tool({
          description:
            "Update (or create) a file in the repository and commit the change. " +
            "ALWAYS read the file first with readFile before updating it. " +
            "Provide the COMPLETE new file content, not just the changed lines.",
          inputSchema: z.object({
            path: z.string().describe("File path relative to repo root, e.g. 'src/lib/utils.ts'"),
            content: z.string().describe("The complete new file content (entire file, not a diff)"),
            commitMessage: z.string().describe("A concise, descriptive commit message for this change"),
          }).describe("Parameters for updating a file and committing"),
          execute: async ({ path: filePath, content: newContent, commitMessage }) => {
            try {
              console.log(`[Tool:updateFile] Updating ${owner}/${repo}/${filePath} @ ${targetRef}`);

              // Step A: Fetch current SHA
              let currentSha: string | undefined;
              try {
                const { data: existing } = await octokit.rest.repos.getContent({
                  owner,
                  repo,
                  path: filePath,
                  ref: targetRef,
                });
                if (!Array.isArray(existing) && existing.type === "file") {
                  currentSha = existing.sha;
                }
              } catch (err: any) {
                if (err?.status !== 404) {
                  return JSON.stringify({
                    success: false,
                    error: `Failed to fetch existing file SHA: ${err?.message}`
                  });
                }
                // 404 means new file
              }

              // Step B: Send Commit
              const { data: commitData } = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: filePath,
                message: commitMessage || "fix: updated file via Kareixo Agent",
                content: Buffer.from(newContent).toString("base64"),
                branch: targetRef,
                ...(currentSha ? { sha: currentSha } : {}),
              });

              const commitUrl = commitData.commit?.html_url || "";
              console.log(`[Tool:updateFile] Success: ${commitUrl}`);
              return `✅ File '${filePath}' updated successfully!\nCommit: ${commitMessage}\nURL: ${commitUrl}`;
            } catch (err: any) {
              console.error(`[Tool:updateFile] Error:`, err?.message);
              // Step C: Ironclad Try/Catch
              return JSON.stringify({
                success: false,
                error: `GitHub Commit Failed: ${err.message}. If this is a 403, please verify that your GitHub App or Token has 'Contents: Read and Write' permissions.`
              });
            }
          },
        });

        /* ═══════════════════════════════════════════
         *  TOOL 5: propose_change (Read-only diff preview)
         *  For the DiffViewer UI — does NOT commit.
         * ═══════════════════════════════════════════ */
        tools.proposeChange = tool({
          description:
            "Propose a code change that the user can review as a diff before applying. " +
            "Use this when the user asks to see a proposed change before committing. " +
            "The user will see a side-by-side diff and can approve or discard.",
          inputSchema: z.object({
            path: z.string().describe("File path relative to repo root, e.g. 'src/lib/utils.ts'"),
            newContent: z.string().describe("The complete new file content after your changes"),
            explanation: z.string().describe("A brief explanation of what the change does and why"),
          }).describe("Parameters for proposing a code change"),
          execute: async ({ path: filePath, newContent, explanation }) => {
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

    /* ─────────────────────────────────────────────────────────
     *  System Prompt — Autonomous Agent Behavior
     * ───────────────────────────────────────────────────────── */
    const hasTools = Object.keys(tools).length > 0;

    let systemPrompt = `You are Kareixo, an autonomous AI engineering agent.`;

    if (repoFullName) {
      systemPrompt += ` You are connected to GitHub repository "${repoFullName}"`;
      if (branch) systemPrompt += ` on branch "${branch}"`;
      systemPrompt += `.`;
    }

    if (hasTools) {
      systemPrompt += `

You have access to the following tools:
- readFile: Read a file's contents from the repository.
- listDirectory: List files and subdirectories.
- searchCode: Search for code patterns across the repo.
- updateFile: Update a file and commit the change to GitHub.
- proposeChange: Propose a code change as a reviewable diff.

RULES — follow these strictly:
1. When the user asks about a file, the codebase, or repository structure, IMMEDIATELY call the appropriate tool (readFile or listDirectory). Do NOT guess or fabricate file contents.
2. After receiving tool results, you MUST provide a thorough text response. Quote key code sections, explain what you found, and directly answer the user's question. NEVER stop after just calling a tool — always follow up with analysis.
3. When asked to fix code or make edits:
   - Do NOT print out "Action: Call readFile" or describe your internal steps in plain text.
   - Silently invoke the tools directly.
   - After the 'updateFile' tool completes, confirm to the user what was changed and provide the commit URL.
4. For complex changes where the user should review first, use proposeChange instead of updateFile.
5. If a tool returns an error, tell the user what happened and suggest an alternative approach.
6. Keep responses focused and technical. Use code blocks with language tags for any code you show.`;
    }

    const initialTier = selectedProvider === "NVIDIA_NIM_KIMI" ? "deep" : selectedProvider === "GROQ" ? "fallback" : "fast";

    const { result, provider } = await router.executeWithFailover(async (p) => {
      const supportsTools = hasTools && p.provider.supportsTools && !p.disableTools;

      try {
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
          onError: (error) => {
            console.error(`[CodeChat] Stream error from ${p.provider.name}:`, error);
          },
          onFinish: async (event) => {
            // Persist conversation to DB
            if (finalConversationId) {
              try {
                const lastUserMsg = rawMessages[rawMessages.length - 1];
                
                if (lastUserMsg) {
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
              console.log(`[CodeChat] Finished: reason=${event.finishReason}, steps=${event.steps?.length || 0}, text=${(event.text || "").length} chars`);
            }
          },
        });

        return res;
      } catch (error) {
        console.error(`[CodeChat] StreamText error (${p.provider.name}):`, error);
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
