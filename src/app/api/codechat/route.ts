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
import { createBranchAndPR } from "@/lib/github-writer";
import { Sandbox } from "e2b";

export const maxDuration = 300;

/* ─────────────────────────────────────────────────────────────
 *  Message Sanitization for NVIDIA NIM
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

    if (msg.role === "tool") {
      sanitized.push({
        role: "tool",
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? ""),
        tool_call_id: msg.tool_call_id || msg.toolCallId || "unknown",
      });
      continue;
    }

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

      if (textParts.trim() || msg.role === "user") {
        sanitized.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: textParts || "",
        });
      }
      continue;
    }

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

    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const lastUserContent = lastUserMsg?.content || "";
    const editKeywords = ["edit", "fix", "add", "update", "create", "delete", "refactor", "commit", "change"];
    const isEditIntent = editKeywords.some(k => lastUserContent.toLowerCase().includes(k));

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

        tools.readFile = tool({
          description: "Read a file from the repository.",
          inputSchema: z.object({ path: z.string() }),
          execute: async ({ path: filePath }) => {
            try {
              const { data } = await octokit.rest.repos.getContent({ owner, repo, path: filePath, ref: targetRef });
              if (Array.isArray(data) || data.type !== "file") return `Error: '${filePath}' is a directory.`;
              return `=== File: ${filePath} ===\n\n${truncate(Buffer.from(data.content, "base64").toString("utf-8"), 12000)}`;
            } catch (err: any) { return `Error reading '${filePath}' (${err?.message})`; }
          }
        });

        tools.listDirectory = tool({
          description: "List files and subdirectories. Use '' or '.' for the root directory.",
          inputSchema: z.object({
            path: z.string().describe("The path to list. Use an empty string '' for the root directory. NEVER use '.'")
          }),
          execute: async ({ path }) => {
            try {
              const safePath = path === "." || path === "./" ? "" : path;
              const { data } = await octokit.rest.repos.getContent({ owner, repo, path: safePath, ref: targetRef });
              
              if (!Array.isArray(data)) {
                return JSON.stringify({ error: "Failed to list directory. GitHub API returned: " + ((data as any).message || "Unknown error") });
              }
              
              const listing = data.map((item: any) => `${item.type === "dir" ? "📁" : "📄"} ${item.name} (${item.size || 0} bytes)`).join("\n");
              return truncate(`=== Directory: ${safePath || "/"} ===\n\n${listing}`, 8000);
            } catch (err: any) {
              return JSON.stringify({ error: `Error listing '${path}' (${err?.message})` });
            }
          }
        });

        tools.searchCode = tool({
          description: "Search for code across the repo.",
          inputSchema: z.object({ query: z.string() }),
          execute: async ({ query }) => {
            try {
              const { data } = await octokit.rest.search.code({ q: `${query} repo:${repoFullName}`, per_page: 10 });
              if (data.total_count === 0) return `No results found for "${query}".`;
              return truncate(`Found ${data.total_count} results:\n\n${data.items.map((item: any) => `📄 ${item.path}`).join("\n")}`, 6000);
            } catch (err: any) { return `Error: Search failed (${err?.message})`; }
          }
        });

        tools.updateFile = tool({
          description: "Update an existing file in the repository. This creates a branch and opens a Pull Request.",
          inputSchema: z.object({
            path: z.string().describe("File path relative to repo root, e.g. 'src/lib/utils.ts'"),
            content: z.string().describe("The COMPLETE new file content"),
            commitMessage: z.string().describe("Commit message for this change"),
            explanation: z.string().describe("Explanation of changes for the PR body")
          }),
          execute: async ({ path: filePath, content: newContent, commitMessage, explanation }) => {
            try {
              let currentSha: string | undefined;
              try {
                const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: filePath, ref: targetRef });
                if (!Array.isArray(existing) && existing.type === "file") currentSha = existing.sha;
              } catch (err: any) {
                if (err?.status !== 404) return JSON.stringify({ success: false, error: err?.message });
              }
              if (!currentSha) return JSON.stringify({ success: false, error: "File not found. Use createFile instead." });
              
              const prResult = await createBranchAndPR({
                octokit, owner, repo, path: filePath, content: newContent,
                baseSha: currentSha, message: commitMessage, explanation: explanation || commitMessage, defaultBranch: targetRef
              });
              return JSON.stringify({ success: true, url: prResult.prUrl, message: `PR opened at ${prResult.prUrl}` });
            } catch (err: any) { return JSON.stringify({ success: false, error: err.message }); }
          }
        });

        tools.createFile = tool({
          description: "Create a NEW file in the repository. This creates a branch and opens a Pull Request.",
          inputSchema: z.object({
            path: z.string().describe("File path relative to repo root"),
            content: z.string().describe("The COMPLETE new file content"),
            commitMessage: z.string().describe("Commit message for this change"),
            explanation: z.string().describe("Explanation of changes for the PR body")
          }),
          execute: async ({ path: filePath, content: newContent, commitMessage, explanation }) => {
            try {
              // Verify file does not exist
              try {
                await octokit.rest.repos.getContent({ owner, repo, path: filePath, ref: targetRef });
                return JSON.stringify({ success: false, error: "File already exists. Use updateFile instead." });
              } catch (err: any) {
                if (err?.status !== 404) return JSON.stringify({ success: false, error: err?.message });
              }
              
              const prResult = await createBranchAndPR({
                octokit, owner, repo, path: filePath, content: newContent,
                baseSha: "", message: commitMessage, explanation: explanation || commitMessage, defaultBranch: targetRef
              });
              return JSON.stringify({ success: true, url: prResult.prUrl, message: `PR opened at ${prResult.prUrl}` });
            } catch (err: any) { return JSON.stringify({ success: false, error: err.message }); }
          }
        });

        tools.deleteFile = tool({
          description: "Delete an existing file in the repository. This creates a branch and opens a Pull Request.",
          inputSchema: z.object({
            path: z.string().describe("File path relative to repo root"),
            commitMessage: z.string().describe("Commit message for this change"),
            explanation: z.string().describe("Explanation of changes for the PR body")
          }),
          execute: async ({ path: filePath, commitMessage, explanation }) => {
            try {
              let currentSha: string | undefined;
              try {
                const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path: filePath, ref: targetRef });
                if (!Array.isArray(existing) && existing.type === "file") currentSha = existing.sha;
              } catch (err: any) {
                return JSON.stringify({ success: false, error: `Failed to fetch file: ${err?.message}` });
              }
              if (!currentSha) return JSON.stringify({ success: false, error: "File not found." });
              
              const timestamp = Date.now();
              const branchName = `kareixo/delete-${timestamp}`;
              
              const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${targetRef}` });
              const baseCommitSha = refData.object.sha;
              await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: baseCommitSha });
              
              await octokit.rest.repos.deleteFile({
                owner, repo, path: filePath, message: commitMessage, sha: currentSha, branch: branchName
              });
              
              const { data: pr } = await octokit.rest.pulls.create({
                owner, repo, title: `[Kareixo CodeChat] ${commitMessage}`,
                head: branchName, base: targetRef, body: `## CodeChat Proposed Deletion\n\n${explanation}\n\n---\n\n*This PR was created by Kareixo CodeChat.*`
              });
              
              return JSON.stringify({ success: true, url: pr.html_url, message: `PR opened at ${pr.html_url}` });
            } catch (err: any) { return JSON.stringify({ success: false, error: err.message }); }
          }
        });

        tools.proposeChange = tools.updateFile; // Alias for backward compatibility if the model uses it

        tools.runCommand = tool({
          description: "Run a shell command (e.g. npm test, tsc, lint) in an isolated sandbox clone of the repo to verify changes before committing.",
          inputSchema: z.object({ command: z.string() }),
          execute: async ({ command }) => {
            if (!process.env.E2B_API_KEY) return JSON.stringify({ success: false, error: "E2B_API_KEY not configured" });
            
            let sandbox: Sandbox | null = null;
            try {
              sandbox = await Sandbox.create({ apiKey: process.env.E2B_API_KEY, timeoutMs: 120_000 });
              
              let cloneUrl = `https://github.com/${owner}/${repo}.git`;
              try {
                const { data: { token } } = await octokit.rest.apps.createInstallationAccessToken({ installation_id: repoRecord.inst.installationId });
                cloneUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
              } catch (e) {}
              
              const cloneResult = await sandbox.commands.run(`git clone --depth 1 --branch ${targetRef} ${cloneUrl} /home/user/repo`, { timeoutMs: 60_000 });
              if (cloneResult.exitCode !== 0) return JSON.stringify({ success: false, error: "Failed to clone repository" });
              
              const lsResult = await sandbox.commands.run("ls /home/user/repo", { timeoutMs: 5_000 });
              const files = lsResult.stdout;
              let installCmd = "npm install --legacy-peer-deps";
              if (files.includes("yarn.lock")) installCmd = "yarn install --frozen-lockfile";
              else if (files.includes("pnpm-lock.yaml")) installCmd = "pnpm install --frozen-lockfile";
              
              const installResult = await sandbox.commands.run(installCmd, { cwd: "/home/user/repo", timeoutMs: 90_000 });
              if (installResult.exitCode !== 0) return JSON.stringify({ success: false, error: "Failed to install dependencies:\n" + installResult.stderr });
              
              const cmdResult = await sandbox.commands.run(command, { cwd: "/home/user/repo", timeoutMs: 90_000 });
              return JSON.stringify({ success: cmdResult.exitCode === 0, exitCode: cmdResult.exitCode, stdout: truncate(cmdResult.stdout, 10000), stderr: truncate(cmdResult.stderr, 10000) });
            } catch (err: any) {
              return JSON.stringify({ success: false, error: err.message });
            } finally {
              if (sandbox) {
                try { await sandbox.kill(); } catch (e) {}
              }
            }
          }
        });

        tools.listOpenPRs = tool({
          description: "List open pull requests for the repository.",
          inputSchema: z.object({}),
          execute: async () => {
            try {
              const { data } = await octokit.rest.pulls.list({ owner, repo, state: "open" });
              return JSON.stringify(data.map((pr: any) => ({ number: pr.number, title: pr.title, url: pr.html_url, status: pr.state })));
            } catch (err: any) { return JSON.stringify({ error: err.message }); }
          }
        });

        tools.getPRStatus = tool({
          description: "Get the status of a specific pull request.",
          inputSchema: z.object({ prNumber: z.number() }),
          execute: async ({ prNumber }) => {
            try {
              const { data } = await octokit.rest.pulls.get({ owner, repo, pull_number: prNumber });
              return JSON.stringify({ number: data.number, title: data.title, url: data.html_url, state: data.state, merged: data.merged });
            } catch (err: any) { return JSON.stringify({ error: err.message }); }
          }
        });
      }
    }

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
- updateFile: Update an existing file (creates a branch and opens a PR).
- createFile: Create a new file (creates a branch and opens a PR).
- deleteFile: Delete a file (creates a branch and opens a PR).
- runCommand: Run a shell command in a sandbox to verify code (e.g. npm test).
- listOpenPRs / getPRStatus: Check the status of work.

RULES — follow these strictly:
1. When the user asks about a file, the codebase, or repository structure, IMMEDIATELY call the appropriate tool (readFile or listDirectory). Do NOT guess or fabricate file contents.
2. After receiving tool results, you MUST provide a thorough text response. Quote key code sections, explain what you found, and directly answer the user's question. NEVER stop after just calling a tool — always follow up with analysis.
3. Every file change results in a pull request. After creating one, always reply with the PR URL and a one-line summary of what changed — never claim a change was made without that URL attached, and never claim you lack file access when tools are present in your context.
4. Keep responses focused and technical. Use code blocks with language tags for any code you show.
5. You have a budget of up to 20 internal steps. If you are examining a folder or fixing multiple issues, use tools heavily and batch actions or prioritize appropriately rather than running out of steps silently.
6. When you need to read a file or list a directory, you MUST use the provided native tools. NEVER output tool calls as markdown code blocks (e.g., no \`\`\`bash listDirectory\`\`\`).`;
    }

    let initialTier: "deep" | "fallback" | "fast" = selectedProvider === "NVIDIA_NIM_KIMI" ? "deep" : selectedProvider === "GROQ" ? "fallback" : "fast";
    if (isEditIntent && repoFullName) {
      initialTier = selectedProvider === "NVIDIA_NIM_KIMI" ? "deep" : "fallback";
    }

    const { result, provider } = await router.executeWithFailover<any>(async (p) => {
      const supportsTools = hasTools && p.provider.supportsTools && !p.disableTools;

      console.log(`[CodeChat Debug] Executing Stream:`, {
        hasTools,
        toolNames: Object.keys(tools),
        tier: initialTier,
        provider: p.provider.name,
        isEditIntent,
        toolChoice: supportsTools ? (isEditIntent ? "required (first step only)" : "auto") : "none"
      });

      try {
        const res = streamText({
          model: p.provider.model,
          system: systemPrompt,
          messages: messages as any,
          ...(supportsTools ? {
            tools,
            maxSteps: 20,
            prepareStep: ({ stepNumber }) => {
              return {
                toolChoice: stepNumber === 0 && isEditIntent ? "required" : "auto",
              };
            }
          } : {}),
          ...(p.provider.name === "GROQ" ? { providerOptions: { groq: { reasoningFormat: "hidden" } } } : {}),
          onError: (error) => { console.error(`[CodeChat] Stream error from ${p.provider.name}:`, error); },
          onFinish: async (event) => {
            if (finalConversationId) {
              try {
                const lastUserMsg = rawMessages[rawMessages.length - 1];
                if (lastUserMsg) {
                  let userContent = "";
                  if (typeof lastUserMsg.content === "string") userContent = lastUserMsg.content;
                  else if (Array.isArray(lastUserMsg.parts)) {
                    userContent = lastUserMsg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("");
                  }
                  await db.insert(chatMessages).values({ conversationId: finalConversationId, role: "user", content: userContent });
                }
                await db.insert(chatMessages).values({ conversationId: finalConversationId, role: "assistant", content: event.text || "", model: provider.modelId });
                await db.update(chatConversations).set({ updatedAt: new Date() }).where(eq(chatConversations.id, finalConversationId));
              } catch (err) { console.error("[CodeChat persistence error]:", err); }
            }
            if (event.finishReason !== "stop" && event.finishReason !== "tool-calls") {
              console.log(`[CodeChat] Finished: reason=${event.finishReason}, steps=${event.steps?.length || 0}, text=${(event.text || "").length} chars`);
            }
          },
        });

        // Intercept the stream to catch immediate failures (e.g. 401/429) before streaming
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
          cancel() {
            reader.cancel();
          }
        });

        Object.defineProperty(res, "fullStream", { value: customFullStream, configurable: true });

        return res;
      } catch (error) {
        console.error(`[CodeChat] StreamText error (${p.provider.name}):`, error);
        throw error;
      }
    }, "chat", initialTier);

    return result.toUIMessageStreamResponse({
      headers: { "x-ai-provider": provider.name, ...(finalConversationId ? { "X-Conversation-Id": finalConversationId } : {}) },
    });
  } catch (error: any) {
    console.error("CodeChat API error:", error);
    return NextResponse.json({ error: error.message || "CodeChat service unavailable." }, { status: 503 });
  }
}
