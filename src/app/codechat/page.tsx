import Navbar from "@/components/landing/Navbar";
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

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      <div className="flex-none">
        <Navbar />
      </div>

      <div className="flex-1 pt-20 pb-4 px-4 max-w-[1600px] mx-auto w-full">
        <div className="h-full rounded-2xl border border-[var(--color-outline)]/20 overflow-hidden shadow-2xl">
          <CodeChatClient repos={repos} />
        </div>
      </div>
    </div>
  );
}
