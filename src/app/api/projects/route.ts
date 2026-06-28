import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = await db.select().from(projects).where(eq(projects.userId, session.user.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const db = getDb();
  const [project] = await db
    .insert(projects)
    .values({ userId: session.user.id, name })
    .returning();

  return NextResponse.json(project, { status: 201 });
}
