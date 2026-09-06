import Navbar from "@/components/landing/Navbar";
import IncidentClient from "./IncidentClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function IncidentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/incident");
  }

  const db = getDb();

  const repoResults = await db
    .select({ repo: repositories, inst: github_installations })
    .from(repositories)
    .innerJoin(
      github_installations,
      eq(repositories.installationId, github_installations.installationId)
    )
    .where(eq(github_installations.userId, session.user.id));

  const repos = repoResults.map(({ repo }) => ({
    fullName: repo.fullName,
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-12">
        <header className="mb-8">
          <h1 className="text-4xl font-display">Incident Tracer</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Paste a stack trace to trace each frame back to the commit and PR that introduced it.
          </p>
        </header>

        <IncidentClient repos={repos} />
      </div>
    </div>
  );
}
