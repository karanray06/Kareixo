import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session: any = await auth();
    const token = await getToken({ req: req as any, secret: process.env.AUTH_SECRET as string, salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token" });
    const accessToken = token?.accessToken;

    if (!session || !accessToken) {
      return NextResponse.json({ error: "Unauthorized or missing GitHub access token" }, { status: 401 });
    }

    const { repo, branch, files, message } = await req.json();

    if (!repo || !branch || !files || !Array.isArray(files) || files.length === 0 || !message) {
      return NextResponse.json({ error: "Missing required fields: repo, branch, files, message" }, { status: 400 });
    }

    const headers = {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    // 1. Get the current branch reference
    const refRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${branch}`, { headers });
    if (!refRes.ok) {
      if (refRes.status === 404) return NextResponse.json({ error: `Branch ${branch} not found` }, { status: 404 });
      return NextResponse.json({ error: "Failed to get branch reference" }, { status: 500 });
    }
    const refData = await refRes.json();
    const currentCommitSha = refData.object.sha;

    // 2. Get the commit tree
    const commitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits/${currentCommitSha}`, { headers });
    if (!commitRes.ok) return NextResponse.json({ error: "Failed to get commit" }, { status: 500 });
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Create a blob for each file and build the new tree structure
    const tree = [];
    for (const file of files) {
      const blobRes = await fetch(`https://api.github.com/repos/${repo}/git/blobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: file.content,
          encoding: "utf-8",
        }),
      });
      if (!blobRes.ok) return NextResponse.json({ error: `Failed to create blob for ${file.path}` }, { status: 500 });
      const blobData = await blobRes.json();

      tree.push({
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blobData.sha,
      });
    }

    // 4. Create the new tree
    const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree,
      }),
    });
    if (!treeRes.ok) return NextResponse.json({ error: "Failed to create tree" }, { status: 500 });
    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    // 5. Create the new commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        tree: newTreeSha,
        parents: [currentCommitSha],
      }),
    });
    if (!newCommitRes.ok) return NextResponse.json({ error: "Failed to create commit" }, { status: 500 });
    const newCommitData = await newCommitRes.json();
    const newSha = newCommitData.sha;

    // 6. Update the branch reference
    const updateRefRes = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        sha: newSha,
        force: false,
      }),
    });
    
    if (!updateRefRes.ok) {
      // Handle protected branch / conflict scenarios
      const errorText = await updateRefRes.text();
      return NextResponse.json({ error: "Failed to update branch reference. Possibly protected or merge conflict.", details: errorText }, { status: 409 });
    }

    return NextResponse.json({ message: "Successfully committed files", sha: newSha }, { status: 200 });

  } catch (error: any) {
    console.error("[GitHub Commit Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
