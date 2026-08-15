import Navbar from "@/components/landing/Navbar";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { repositories, github_installations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import SettingsForm from "./SettingsForm";

export default async function RepositorySettingsPage({ params }: { params: { repoId: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { repoId } = await params;
  const db = getDb();

  const [repoWithAuth] = await db
    .select({ repo: repositories, inst: github_installations })
    .from(repositories)
    .innerJoin(
      github_installations,
      eq(repositories.installationId, github_installations.installationId)
    )
    .where(
      and(
        eq(repositories.id, repoId),
        eq(github_installations.userId, session.user.id)
      )
    );

  if (!repoWithAuth) {
    redirect("/dashboard");
  }

  const { repo } = repoWithAuth;

  let initialCategories = ["logic", "security", "style"];
  try {
    if (repo.enabledCategories) {
      initialCategories = JSON.parse(repo.enabledCategories);
    }
  } catch (e) {
    console.error("Failed to parse categories", e);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-12">
        <a href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-sky-blue)] transition-colors mb-6 font-semibold">
          <FiArrowLeft /> Back to Dashboard
        </a>
        <header className="mb-12">
          <h1 className="text-4xl font-display">{repo.fullName}</h1>
          <p className="text-[var(--text-secondary)] mt-2">Configure Kareixo rules and review behavior for this repository.</p>
        </header>

        <SettingsForm
          repoId={repo.id}
          initialCategories={initialCategories}
          initialTier={repo.preferredTier || "fast"}
          initialInstructions={repo.customInstructions || ""}
        />
      </div>
    </div>
  );
}
