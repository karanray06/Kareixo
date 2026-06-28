import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { planTasks, PlannerError } from "@/lib/agent-planner";

// Simple in-memory rate limiting for the planner (5 plans per user per 10m)
const plannerRateLimit = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate Limiting Check
    const now = Date.now();
    const userLimit = plannerRateLimit.get(userId);
    if (userLimit && userLimit.expiresAt > now) {
      if (userLimit.count >= 5) {
        return NextResponse.json(
          { error: "Too many planning requests. Please try again later." },
          { status: 429 }
        );
      }
      userLimit.count++;
    } else {
      plannerRateLimit.set(userId, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    }

    const body = await req.json();
    const { prompt, projectId, projectContext } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 });
    }
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "Valid projectId is required" }, { status: 400 });
    }

    // Verify Project Ownership
    const db = getDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    // Generate Plan
    const tasks = await planTasks(prompt, projectContext || "Empty project context");

    return NextResponse.json({ tasks });

  } catch (error: any) {
    if (error instanceof PlannerError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[Agent Planner Error]", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
