import Navbar from "@/components/landing/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-8">
        <h1 className="text-4xl font-display">Terms of Service</h1>
        <p className="text-[var(--text-secondary)]">Last updated: August 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p className="text-[var(--text-secondary)]">
            By installing or using Kareixo, you agree to these Terms of Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Service Description</h2>
          <p className="text-[var(--text-secondary)]">
            Kareixo provides automated code review services via GitHub Apps. We use third-party AI models to analyze code diffs and post comments on Pull Requests.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Fair Use & Limitations</h2>
          <p className="text-[var(--text-secondary)]">
            The free tier is provided as-is and is subject to rate limits. We reserve the right to suspend or terminate accounts that abuse the API or exceed reasonable usage thresholds.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Disclaimer of Warranties</h2>
          <p className="text-[var(--text-secondary)]">
            Kareixo is provided "as is" without warranty of any kind. We do not guarantee that the code reviews will be error-free or that they will catch all security vulnerabilities. You are responsible for your own code quality and security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Changes to Terms</h2>
          <p className="text-[var(--text-secondary)]">
            We may update these terms occasionally. Continued use of the service constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
}
