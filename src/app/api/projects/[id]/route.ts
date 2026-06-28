import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
  }

  const db = getDb();
  const [updated] = await db
    .update(projects)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(projects.id, params.id), eq(projects.userId, session.user.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(updated);
}
