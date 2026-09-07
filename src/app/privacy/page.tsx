import Navbar from "@/components/landing/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-8">
        <h1 className="text-4xl font-display">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)]">Last updated: August 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Data Collection</h2>
          <p>
            When you install Kareixo on your GitHub account or organization, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
            <li>Your GitHub account ID, login name, and email address.</li>
            <li>Metadata about the repositories you grant us access to.</li>
            <li>The content of Pull Requests (diffs) that we review.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Third-Party LLM Providers</h2>
          <p className="text-[var(--text-secondary)]">
            To provide automated code reviews, the diff content from your Pull Requests is sent to third-party LLM providers (such as Google (Gemini API)) for analysis. 
            We do not store your code or diffs after the review is generated. We only retain the generated summary and metadata to provide you with an activity dashboard.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Data Retention</h2>
          <p className="text-[var(--text-secondary)]">
            We retain your GitHub account information and repository metadata for as long as the Kareixo app is installed. If you uninstall the app, your repository records will be deleted from our active database.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="text-[var(--text-secondary)]">
            If you have any questions about this Privacy Policy, please open an issue on our GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
