import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session: any = await auth();
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized or missing GitHub access token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repo = searchParams.get("repo"); // e.g. "karanray06/Kareixo"
    const branch = searchParams.get("branch") || "main";
    const path = searchParams.get("path"); // optional, to fetch file content

    if (!repo) {
      return NextResponse.json({ error: "Missing repo parameter" }, { status: 400 });
    }

    if (path) {
      // Fetch specific file content
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
          Authorization: `token ${session.accessToken}`,
          Accept: "application/vnd.github.v3.raw",
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch file content" }, { status: response.status });
      }

      const content = await response.text();
      return new NextResponse(content, { headers: { "Content-Type": "text/plain" } });
    } else {
      // Fetch file tree
      const response = await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`, {
        headers: {
          Authorization: `token ${session.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch repository tree" }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data.tree);
    }
  } catch (error: any) {
    console.error("[GitHub API] fetch tree error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
