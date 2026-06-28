import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { files, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Verify the project belongs to the requesting user
async function assertProjectOwner(projectId: string, userId: string) {
  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
  return project ?? null;
}

// GET /api/projects/[id]/files — list all files for a project
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await assertProjectOwner(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getDb();
  const rows = await db.select().from(files).where(eq(files.projectId, id));
  return NextResponse.json(rows);
}

// POST /api/projects/[id]/files — create a new file
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await assertProjectOwner(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { path, content = "" } = await req.json();
  if (!path) return NextResponse.json({ error: "path is required" }, { status: 400 });

  const db = getDb();
  const [file] = await db
    .insert(files)
    .values({ projectId: id, path, content })
    .returning();

  return NextResponse.json(file, { status: 201 });
}

// PATCH /api/projects/[id]/files — update a file's content by path
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await assertProjectOwner(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { path, content } = await req.json();
  if (!path || content === undefined) {
    return NextResponse.json({ error: "path and content are required" }, { status: 400 });
  }

  const db = getDb();
  const [updated] = await db
    .update(files)
    .set({ content, updatedAt: new Date() })
    .where(and(eq(files.projectId, id), eq(files.path, path)))
    .returning();

  if (!updated) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.json(updated);
}
