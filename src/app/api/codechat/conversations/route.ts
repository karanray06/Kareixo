import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { chatConversations } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const repoFullName = url.searchParams.get("repoFullName");

    const db = getDb();

    let query = db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, session.user.id))
      .orderBy(desc(chatConversations.updatedAt));

    const allConversations = await query;
    
    // Filter by repo in memory if provided, or return all
    const conversations = repoFullName 
      ? allConversations.filter(c => c.repoFullName === repoFullName)
      : allConversations;

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoFullName, branch, title } = await req.json();

    const db = getDb();
    const [conversation] = await db.insert(chatConversations).values({
      userId: session.user.id,
      repoFullName: repoFullName || null,
      branch: branch || null,
      title: title || "New Conversation",
    }).returning();

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
