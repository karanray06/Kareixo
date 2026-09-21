import { streamText, stepCountIs, tool } from "ai";
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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limiting: 30 requests per minute
    const user = session.user;
    const rateCheck = checkRateLimit(session.user.id);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const { messages: rawMessages, repoFullName, branch, conversationId, provider: selectedProvider } = await req.json();

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
    const db = getDb();
    
    let finalConversationId = conversationId;
    if (!finalConversationId && messages.length > 0) {
      const firstUserMsg = messages.find((m: any) => m.role === 'user');
      const title = (firstUserMsg?.content || "New Conversation").slice(0, 40);
      try {
        const [newConv] = await db.insert(chatConversations).values({
          userId: session.user.id,
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
            eq(github_installations.userId, session.user.id)
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
          }),
          execute: async ({ path: filePath }) => {
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
        });

        // NOTE: must be "inputSchema", not "parameters" — ai@7 requirement, has regressed before
        // Tool: List directory contents
        tools.listDirectory = tool({
          description: "List the contents of a directory in the repository. Use this to explore the file structure.",
          inputSchema: z.object({
            path: z.string().describe("The directory path relative to repo root, e.g. 'src/lib' or '' for root").default(""),
          }),
          execute: async ({ path: dirPath }) => {
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
        });

        // NOTE: must be "inputSchema", not "parameters" — ai@7 requirement, has regressed before
        // Tool: Search for code in the repo
        tools.searchCode = tool({
          description: "Search for code in the repository using GitHub's code search.",
          inputSchema: z.object({
            query: z.string().describe("The search query, e.g. 'function handleSubmit' or 'import router'"),
          }),
          execute: async ({ query }) => {
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
          }),
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
    let systemPrompt = `You are Kareixo CodeChat — an expert AI coding assistant. You help developers understand, debug, and improve their code.`;
    
    if (repoFullName) {
      systemPrompt += `\n\nYou are working with the repository: ${repoFullName}`;
      if (branch) systemPrompt += ` (branch: ${branch})`;
      systemPrompt += `\n\nYou have access to tools to read files, explore the repository structure, and propose code changes. Use them when you need to see actual code — don't guess at implementations.`;
      systemPrompt += `\n\nWhen the user asks about code, always read the relevant file(s) first before answering.`;
      systemPrompt += `\n\nWhen the user asks you to fix, refactor, or modify code, use the proposeChange tool to propose the change. Always read the file first, then propose the full modified file content. The user will see a diff and can approve or discard.`;
    }

    const hasTools = Object.keys(tools).length > 0;

    const { result, provider } = await router.executeWithFailover(async (p) => {
      const res = streamText({
        model: p.model,
        system: systemPrompt,
        messages,
        ...(hasTools && p.name !== "POLLINATIONS" && p.name !== "NVIDIA_NIM" ? { tools, stopWhen: stepCountIs(5) } : {}),
        ...(p.name === "GROQ" ? {
          providerOptions: {
            groq: { reasoningFormat: "hidden" },
          },
        } : {}),
        ...(p.name === "NVIDIA_NIM" ? {
          maxTokens: 2048,
          temperature: 0.5,
          topP: 1,
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
                model: provider.modelName,
              });

              await db.update(chatConversations)
                .set({ updatedAt: new Date() })
                .where(eq(chatConversations.id, finalConversationId));
            } catch (err) {
              console.error("[CodeChat persistence error]:", err);
            }
          }
        },
        onError: ({ error }) => {
          console.error("[CodeChat streamText error]:", error);
        }
      });

      return res;
    }, "code", "deep", selectedProvider);

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelName,
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
