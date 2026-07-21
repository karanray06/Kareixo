import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";

export async function GET(req: any) {
  try {
    const session: any = await auth();
    const token = await getToken({ req, secret: process.env.AUTH_SECRET as string, salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token" });
    
    const accessToken = token?.accessToken;
    
    if (!session || !accessToken) {
      return NextResponse.json({ error: "Unauthorized or missing GitHub access token" }, { status: 401 });
    }

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status });
    }

    const repos = await response.json();
    
    // Map to a simpler structure for the UI
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      url: repo.html_url,
      updatedAt: repo.updated_at,
      language: repo.language
    }));

    return NextResponse.json(formattedRepos);
  } catch (error: any) {
    console.error("[GitHub API] fetch repos error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
