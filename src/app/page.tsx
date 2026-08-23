import HeroScene from "@/components/landing/HeroScene";
import Navbar from "@/components/landing/Navbar";
import { FiCheckCircle, FiShield, FiZap, FiGithub, FiCpu, FiCode } from "react-icons/fi";

export default function Home() {
  return (
    <main className="min-h-screen text-[var(--text-primary)] font-sans bg-[var(--bg-base)]">
      <Navbar />
      <HeroScene />

      {/* Section: How It Works */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-display">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--color-outline)] flex items-center justify-center text-2xl font-bold">
              1
            </div>
            <h3 className="text-2xl font-bold">Install the App</h3>
            <p className="text-[var(--text-secondary)]">Add the Kareixo GitHub App to your repositories with one click. No configuration needed.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--color-outline)] flex items-center justify-center text-2xl font-bold">
              2
            </div>
            <h3 className="text-2xl font-bold">Open a PR</h3>
            <p className="text-[var(--text-secondary)]">Kareixo automatically listens for new pull requests and synchronizations on your codebase.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-sky-blue)] border-2 border-[var(--color-outline)] flex items-center justify-center text-2xl font-bold">
              3
            </div>
            <h3 className="text-2xl font-bold">Get Reviewed</h3>
            <p className="text-[var(--text-secondary)]">Receive inline comments and actionable suggested changes directly in your GitHub UI in minutes.</p>
          </div>
        </div>
      </section>

      {/* Section: What It Catches */}
      <section className="py-24 px-6 md:px-12 bg-[var(--bg-elevated)] border-y border-[var(--color-outline)]/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-display">
            What it catches
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[var(--bg-base)] p-8 rounded-2xl border border-[var(--color-outline)]/10 space-y-4">
              <FiZap className="w-8 h-8 text-[var(--color-coral)]" />
              <h3 className="text-xl font-bold">Logic Errors</h3>
              <p className="text-[var(--text-secondary)] text-sm">Identifies edge cases, off-by-one errors, and faulty async logic before it lands.</p>
            </div>
            <div className="bg-[var(--bg-base)] p-8 rounded-2xl border border-[var(--color-outline)]/10 space-y-4">
              <FiShield className="w-8 h-8 text-[var(--color-lavender)]" />
              <h3 className="text-xl font-bold">Security Flaws</h3>
              <p className="text-[var(--text-secondary)] text-sm">Spots injection vectors, unvalidated inputs, and accidental secret exposures.</p>
            </div>
            <div className="bg-[var(--bg-base)] p-8 rounded-2xl border border-[var(--color-outline)]/10 space-y-4">
              <FiCpu className="w-8 h-8 text-[var(--color-sky-blue)]" />
              <h3 className="text-xl font-bold">Performance</h3>
              <p className="text-[var(--text-secondary)] text-sm">Flags N+1 queries, unnecessary re-renders, and memory leaks.</p>
            </div>
            <div className="bg-[var(--bg-base)] p-8 rounded-2xl border border-[var(--color-outline)]/10 space-y-4">
              <FiCode className="w-8 h-8 text-[var(--color-mint)]" />
              <h3 className="text-xl font-bold">Code Style</h3>
              <p className="text-[var(--text-secondary)] text-sm">Ensures consistency with standard practices and improves readability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Trust & Data */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold font-display">Trust & Data</h2>
        <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
          We never store your code. Diffs are securely sent to our LLM providers and immediately discarded after the review is generated. Our providers are strictly prohibited from using your data to train their models.
        </p>
      </section>

      {/* Section: Why Free */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto text-center space-y-12">
        <h2 className="text-4xl md:text-5xl font-bold font-display">
          How is it free?
        </h2>
        <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
          Kareixo relies entirely on NVIDIA's powerful NIM APIs. When you connect a repository, your reviews are powered by the fastest and most capable models hosted directly by NVIDIA, with automatic failover to guarantee uptime.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {["Kimi", "DeepSeek", "Qwen", "Mistral", "MiniMax", "GLM", "Gemma"].map((provider) => (
            <span key={provider} className="px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-full font-mono text-sm font-semibold">
              {provider}
            </span>
          ))}
        </div>
      </section>

      {/* Section: Kareixo Chat */}
      <section className="py-24 px-6 md:px-12 bg-[var(--bg-elevated)] border-t border-[var(--color-outline)]/20 text-center space-y-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
            Meet Kareixo Chat
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            The same resilient, NVIDIA-powered multi-model architecture, now available as a general-purpose AI chat assistant. Seamlessly fall back across the best models available.
          </p>
          <a
            href="/chat"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            Try Kareixo Chat
          </a>
        </div>
      </section>

      {/* Section: CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-5xl mb-8 font-display">Ready to level up your code?</h2>
        <a
          href="https://github.com/apps/kareixo-reviewer/installations/new"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white !text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
        >
          <FiGithub className="w-5 h-5" />
          Install on GitHub
        </a>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--color-outline)]/10 text-[var(--text-secondary)] text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-md flex items-center justify-center">
              <img src="/logo.png" alt="Kareixo Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">Kareixo</span>
          </div>
          <div className="flex gap-6 flex-wrap justify-center mt-6 md:mt-0">
            <a href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            <a href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
            <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
