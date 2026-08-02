import { auth } from "@/auth";
import { getDb } from "@/db";
import { github_installations } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const installationId = url.searchParams.get("installation_id");

  const relativeCallback = `/api/github/setup${url.search}`;

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(relativeCallback)}`, req.url)
    );
  }

  if (installationId) {
    const db = getDb();
    const installationNumber = Number(installationId);

    if (!Number.isNaN(installationNumber)) {
      await db
        .insert(github_installations)
        .values({
          installationId: installationNumber,
          userId: session.user.id,
          accountLogin: "",
        })
        .onConflictDoUpdate({
          target: github_installations.installationId,
          set: {
            userId: session.user.id,
          },
        });
    }
  }

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
