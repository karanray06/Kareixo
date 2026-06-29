import { streamText } from "ai";
import { router } from "./model-router";

/** Max time a single provider attempt may spend streaming before we abort and fail over. */
const PER_ATTEMPT_TIMEOUT_MS = 45_000;

export interface AgentTask {
  id: string;
  filename: string;
  description: string;
  status: "pending" | "running" | "done" | "failed";
  code?: string;
  error?: string;
  retries: number;
}

export class PlannerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlannerError";
  }
}

const PLANNER_SYSTEM_PROMPT = `
You are an expert AI architect planning a multi-step codebase change.
The user will provide a request and the current project context (file tree, tech stack).
Your job is to break this request down into a clear, sequential list of file changes.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of tasks. No markdown formatting, no explanations before or after.
2. The JSON must be an array of objects matching this exact structure:
   [{ "filename": "path/to/file.ts", "description": "Detailed instructions on what needs to change or be created in this file" }]
3. Order matters. If a file depends on another, the dependency MUST come first.
4. Keep tasks focused. One task per file.
5. Limit to 20 tasks maximum.

EXAMPLE OUTPUT:
[
  {
    "filename": "src/utils/helpers.ts",
    "description": "Create a new helper function parseData() that takes a string and returns a structured object."
  },
  {
    "filename": "src/components/DataView.tsx",
    "description": "Import parseData from helpers.ts and use it to render the structured object."
  }
]
`;

export async function planTasks(userPrompt: string, projectContext: string): Promise<AgentTask[]> {
  const { result } = await router.executeWithFailover(async (provider) => {
    // Stream instead of one blocking generateText() call: actively pull chunks so a
    // dead/slow provider is detected quickly instead of stalling in a single silent await.
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
        model: provider.model,
        system: PLANNER_SYSTEM_PROMPT,
        prompt: `PROJECT CONTEXT:\n${projectContext}\n\nUSER REQUEST:\n${userPrompt}`,
        temperature: 0.2, // Lower temperature for more predictable JSON output
        abortSignal: controller.signal,
      });

      let text = "";
      for await (const chunk of stream.textStream) {
        text += chunk;
      }
      return text;
    })();

    try {
      // The caller needs the FULL JSON array before it can parse, so we accumulate
      // the whole response here; the per-attempt timeout lets failover react to a
      // slow provider instead of burning the entire 60s function budget.
      return await Promise.race([accumulate, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }, "chat");

  const rawText = result.trim();
  
  // Extract JSON if the model ignored instructions and wrapped in markdown
  let jsonString = rawText;
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new PlannerError("Failed to parse model output as JSON. The AI did not return a valid task list.");
  }

  if (!Array.isArray(parsed)) {
    throw new PlannerError("Expected a JSON array of tasks, but received something else.");
  }

  if (parsed.length === 0) {
    throw new PlannerError("The AI returned an empty task list.");
  }

  if (parsed.length > 20) {
    throw new PlannerError("The AI proposed too many tasks (maximum 20 allowed). Please narrow your request.");
  }

  const tasks: AgentTask[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item.filename || typeof item.filename !== "string") {
      throw new PlannerError(`Task ${i + 1} is missing a valid 'filename' string.`);
    }
    if (!item.description || typeof item.description !== "string") {
      throw new PlannerError(`Task ${i + 1} is missing a valid 'description' string.`);
    }
    
    tasks.push({
      id: crypto.randomUUID(),
      filename: item.filename,
      description: item.description,
      status: "pending",
      retries: 0
    });
  }

  return tasks;
}
