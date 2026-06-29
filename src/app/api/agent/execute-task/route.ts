import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { streamText } from "ai";
import { router } from "@/lib/model-router";
import { checkSecurity } from "@/lib/security-check";

export const maxDuration = 60;

/** Max time a single provider attempt may spend streaming before we abort and fail over. */
const PER_ATTEMPT_TIMEOUT_MS = 45_000;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { task, projectId, projectContext, existingCode } = body;

    if (!task || !task.filename || !task.description) {
      return NextResponse.json({ error: "Valid task object is required" }, { status: 400 });
    }
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "Valid projectId is required" }, { status: 400 });
    }

    // Verify Project Ownership
    const db = getDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    const systemPrompt = `You are an expert AI software engineer. You are executing one step in a broader project plan.
Your task is to provide the EXACT code for: ${task.filename}.

CRITICAL INSTRUCTIONS:
1. ONLY return the final file content.
2. NO markdown formatting, NO \`\`\` language blocks, NO explanations.
3. Your output will be written directly to the file.
4. TASK DESCRIPTION: ${task.description}

Here is the context of the project so far:
${projectContext || "No other files"}

${existingCode ? `Here is the EXISTING content of ${task.filename}:\n${existingCode}\n\nUpdate this file according to the task description.` : "This is a new file."}`;

    // Execute via ModelRouter. Stream and accumulate internally rather than blocking on
    // one generateText() await: this keeps the function actively pulling data and lets
    // the per-attempt timeout fail over to the next provider instead of dying at 60s.
    const { result, provider } = await router.executeWithFailover(async (p) => {
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;

      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error(`Provider stream exceeded ${PER_ATTEMPT_TIMEOUT_MS}ms timeout`));
        }, PER_ATTEMPT_TIMEOUT_MS);
      });

      const accumulate = (async () => {
        const stream = streamText({
          model: p.model,
          system: systemPrompt,
          prompt: "Provide the code for the requested file.",
          temperature: 0.3, // Low temperature for code reliability
          abortSignal: controller.signal,
        });

        let code = "";
        for await (const chunk of stream.textStream) {
          code += chunk;
        }
        return code;
      })();

      try {
        // Security check and file-write both need the COMPLETE file content,
        // so assemble the full string before returning.
        return await Promise.race([accumulate, timeout]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    }, "code");

    let generatedCode = result;
    
    // Fallback cleanup in case the model ignored instruction 2
    if (generatedCode.startsWith("\`\`\`")) {
      generatedCode = generatedCode.replace(/^\`\`\`[\w-]*\n/, "").replace(/\n\`\`\`$/, "");
    }

    // Run Security Check Inline
    const securityResult = await checkSecurity(generatedCode);

    return NextResponse.json({
      code: generatedCode,
      securityResult,
      provider: provider.name,
      model: provider.modelName
    });

  } catch (error: any) {
    console.error("[Agent Execute Error]", error);
    return NextResponse.json({ error: error.message || "Failed to execute task" }, { status: 500 });
  }
}
