import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CodeChatClient from "./CodeChatClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CodeChatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/codechat");
  }

  const db = getDb();

  // Fetch user's connected repos
  const repoResults = await db
    .select({ repo: repositories, inst: github_installations })
    .from(repositories)
    .innerJoin(
      github_installations,
      eq(repositories.installationId, github_installations.installationId)
    )
    .where(eq(github_installations.userId, session.user.id));

  const repos = repoResults.map(({ repo, inst }) => ({
    fullName: repo.fullName,
    installationId: inst.installationId,
  }));

  const headerRepos = repoResults.map(({ repo }) => ({
    fullName: repo.fullName,
  }));

  return (
    <div className="flex flex-col h-screen bg-canvas-default">
      <DashboardHeader user={session.user} repos={headerRepos} />
      <div className="flex-1 pt-16 overflow-hidden">
        <CodeChatClient repos={repos} />
      </div>
    </div>
  );
}
