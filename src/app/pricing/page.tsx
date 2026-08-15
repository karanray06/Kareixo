import Navbar from "@/components/landing/Navbar";
import { FiCheck } from "react-icons/fi";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-display">Simple, transparent pricing</h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Get automated code reviews on every Pull Request. Start for free, upgrade when your team needs more.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-3xl p-8 space-y-6 flex flex-col">
            <div>
              <h2 className="text-2xl font-bold">Hobby</h2>
              <p className="text-[var(--text-secondary)] mt-2">For individuals and small side projects.</p>
            </div>
            <div className="text-4xl font-display font-bold">
              $0 <span className="text-lg text-[var(--text-secondary)] font-normal">/mo</span>
            </div>
            <ul className="space-y-4 flex-grow">
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Up to 50 PR reviews/month</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Fast AI models</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Standard dashboard</span>
              </li>
            </ul>
            <a href="https://github.com/apps/kareixo-reviewer/installations/new" className="block w-full py-3 px-6 text-center border border-[var(--color-outline)]/30 rounded-full font-semibold hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors">
              Install for Free
            </a>
          </div>

          {/* Pro Tier */}
          <div className="bg-[var(--text-primary)] text-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-3xl p-8 space-y-6 flex flex-col relative transform md:-translate-y-4 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-sky-blue)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pro</h2>
              <p className="opacity-80 mt-2">For professional developers and active repositories.</p>
            </div>
            <div className="text-4xl font-display font-bold">
              $19 <span className="text-lg opacity-80 font-normal">/mo</span>
            </div>
            <ul className="space-y-4 flex-grow">
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Unlimited PR reviews</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Deep AI models (DeepSeek, etc.)</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Custom team instructions</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Severity-gated Check Runs</span>
              </li>
            </ul>
            <button className="block w-full py-3 px-6 text-center bg-[var(--bg-base)] text-[var(--text-primary)] rounded-full font-semibold hover:scale-105 transition-transform">
              Coming Soon — Join Waitlist
            </button>
          </div>

          {/* Team Tier */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-3xl p-8 space-y-6 flex flex-col">
            <div>
              <h2 className="text-2xl font-bold">Team</h2>
              <p className="text-[var(--text-secondary)] mt-2">For organizations scaling their code quality.</p>
            </div>
            <div className="text-4xl font-display font-bold">
              $49 <span className="text-lg text-[var(--text-secondary)] font-normal">/mo</span>
            </div>
            <ul className="space-y-4 flex-grow">
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Org-wide dashboard & analytics</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Slack & Discord daily digests</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCheck className="text-[var(--color-mint)] flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <button className="block w-full py-3 px-6 text-center border border-[var(--color-outline)]/30 rounded-full font-semibold hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors">
              Coming Soon — Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
