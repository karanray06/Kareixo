import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncUserRepositories } from "@/lib/sync-repositories";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncUserRepositories(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to sync repositories:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
