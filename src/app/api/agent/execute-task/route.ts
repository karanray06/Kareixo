import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateText } from "ai";
import { router } from "@/lib/model-router";
import { checkSecurity } from "@/lib/security-check";

export const maxDuration = 60;

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

    // Execute via ModelRouter
    const { result, provider } = await router.executeWithFailover(async (p) => {
      return await generateText({
        model: p.model,
        system: systemPrompt,
        prompt: "Provide the code for the requested file.",
        temperature: 0.3, // Low temperature for code reliability
      });
    }, "code");

    let generatedCode = result.text;
    
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
