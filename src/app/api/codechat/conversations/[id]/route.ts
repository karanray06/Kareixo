import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Verify ownership
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.id, id),
          eq(chatConversations.userId, session.user.id)
        )
      );

    if (!conversation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Get messages
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, id))
      .orderBy(asc(chatMessages.createdAt));

    // Convert to AI SDK UIMessage format
    const uiMessages = messages.map(m => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ conversation, messages: uiMessages });
  } catch (error: any) {
    console.error("Failed to fetch conversation history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
