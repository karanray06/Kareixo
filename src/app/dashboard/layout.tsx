import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Fetch repos for the header repo switcher
  const db = getDb();
  let repos: { fullName: string; defaultBranch?: string }[] = [];
  try {
    const repoResults = await db
      .select({ repo: repositories })
      .from(repositories)
      .innerJoin(
        github_installations,
        eq(repositories.installationId, github_installations.installationId)
      )
      .where(eq(github_installations.userId, session.user.id));

    repos = repoResults.map(({ repo }) => ({
      fullName: repo.fullName,
    }));
  } catch {
    // DB not available or schema mismatch — header will show without repos
  }

  return (
    <div className="min-h-screen bg-canvas-default text-on-surface font-body-base antialiased selection:bg-accent-blue selection:text-canvas-inset">
      <DashboardHeader user={session.user} repos={repos} />
      <main className="w-full pt-16 flex-1 bg-canvas-default">
        {children}
      </main>
    </div>
  );
}
