import Navbar from "@/components/landing/Navbar";
import { 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Code2, 
  ArrowRight,
  GitPullRequest,
  TerminalSquare,
  Lock
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen text-[var(--text-primary)] font-sans bg-[var(--bg-base)]">
      <Navbar />

      {/* ── 1. Hero Section ── */}
      <section className="pt-40 pb-20 px-6 max-w-[1280px] mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-base)] text-[var(--text-secondary)] text-xs font-semibold tracking-wider mb-8 uppercase">
          <GitPullRequest size={14} /> AI Code Review for GitHub
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Ship better code.<br />
          <span className="text-[var(--text-muted)]">Automatically.</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Kareixo reviews your pull requests with AI, catches issues before they reach production, and gives your team actionable feedback directly in GitHub.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="https://github.com/apps/kareixo-reviewer/installations/new"
            className="btn btn-primary h-12 px-8 text-base w-full sm:w-auto shadow-lg shadow-black/5"
          >
            <FiGithub size={18} />
            Install on GitHub
          </a>
          <a
            href="#how-it-works"
            className="btn btn-secondary h-12 px-8 text-base w-full sm:w-auto"
          >
            Explore how it works
          </a>
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium">
          Free forever &middot; No configuration &middot; GitHub-native
        </p>
      </section>

      {/* ── 2. Hero Visual (Mockup) ── */}
      <section className="px-6 max-w-[1000px] mx-auto mb-24 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="card p-0 overflow-hidden shadow-xl shadow-black/5 border-[var(--border-strong)]">
          {/* Header */}
          <div className="bg-[var(--bg-subtle)] border-b border-[var(--border-base)] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-green-500"><GitPullRequest size={18} /></div>
              <span className="font-medium text-sm">Add authentication middleware</span>
              <span className="text-[var(--text-muted)] text-sm">#284</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-green bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 size={12} /> Kareixo reviewed
              </span>
            </div>
          </div>
          {/* Body */}
          <div className="p-6">
            <div className="border border-[var(--border-base)] rounded-lg overflow-hidden font-mono text-sm">
              <div className="bg-[var(--bg-subtle)] px-4 py-2 border-b border-[var(--border-base)] text-[var(--text-secondary)] text-xs flex justify-between">
                <span>src/middleware/auth.ts</span>
                <span>1 finding</span>
              </div>
              <div className="p-4 bg-[var(--bg-base)]">
                <div className="flex gap-4 opacity-50">
                  <span className="select-none">12</span>
                  <span className="text-[var(--text-primary)]">export async function middleware(req: Request) {"{"}</span>
                </div>
                <div className="flex gap-4 opacity-50">
                  <span className="select-none">13</span>
                  <span className="text-[var(--text-primary)]">  const token = req.headers.get("Authorization");</span>
                </div>
                <div className="flex gap-4 bg-red-500/5 -mx-4 px-4 py-1 border-l-2 border-red-500">
                  <span className="select-none text-red-500">14</span>
                  <span className="text-red-600 font-medium">  const user = await verify(token); // ⚠ Security Risk</span>
                </div>
                
                {/* AI Comment Box */}
                <div className="mt-4 ml-8 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-md shadow-sm p-4 text-sans text-base">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={16} className="text-red-500" />
                    <span className="font-semibold text-sm">Security &middot; High Severity</span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-3">
                    The token is used directly without checking if it exists or if the format is correct (e.g., Bearer token). This can cause verification to fail unexpectedly or expose unhandled promise rejections.
                  </p>
                  <div className="bg-[var(--bg-subtle)] border border-[var(--border-base)] rounded p-3 font-mono text-xs">
                    <div className="text-green-600">+  if (!token || !token.startsWith("Bearer ")) return new Response("Unauthorized", {"{"} status: 401 {"}"});</div>
                    <div className="text-green-600">+  const user = await verify(token.split(" ")[1]);</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Trust Strip ── */}
      <section className="py-10 border-y border-[var(--border-base)] bg-[var(--bg-subtle)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap justify-center gap-x-12 gap-y-6 text-[var(--text-secondary)] font-medium text-sm">
          <div className="flex items-center gap-2"><Code2 size={16} /> Built for developers</div>
          <div className="flex items-center gap-2"><FiGithub size={16} /> GitHub-native</div>
          <div className="flex items-center gap-2"><Lock size={16} /> Privacy conscious</div>
          <div className="flex items-center gap-2"><Zap size={16} /> AI-powered</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={16} /> Free forever</div>
        </div>
      </section>

      {/* ── 4. How It Works ── */}
      <section id="how-it-works" className="section">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">From pull request to reviewed code.</h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Kareixo fits directly into the workflow your team already uses. No new dashboards to check, no complex configuration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-6 left-12 right-12 h-px bg-[var(--border-base)] -z-10"></div>
          
          <div className="space-y-6 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-base)]">
            <div className="w-12 h-12 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-full flex items-center justify-center font-mono text-sm font-bold shadow-sm">01</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Connect GitHub</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Install the Kareixo GitHub App on your repository in one click. No API keys or webhooks to configure.
              </p>
            </div>
          </div>

          <div className="space-y-6 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-base)]">
            <div className="w-12 h-12 bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-full flex items-center justify-center font-mono text-sm font-bold shadow-sm">02</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Open a pull request</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Keep working exactly how you work today. Kareixo automatically detects new and updated pull requests.
              </p>
            </div>
          </div>

          <div className="space-y-6 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-base)]">
            <div className="w-12 h-12 bg-[var(--color-accent)] text-[var(--color-accent-fg)] rounded-full flex items-center justify-center font-mono text-sm font-bold shadow-md">03</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Get actionable feedback</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Receive inline review findings, rationale, and suggested improvements directly in your GitHub PR timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. What Kareixo Catches ── */}
      <section id="product" className="section bg-[var(--bg-subtle)] border-y border-[var(--border-base)]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 max-w-2xl mx-auto">
          Find problems before they become production problems.
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card group hover:-translate-y-1">
            <div className="mb-6 w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] flex items-center justify-center group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-accent)] transition-colors">
              <GitPullRequest size={20} />
            </div>
            <h3 className="text-xl font-bold mb-3">Logic errors</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Catch edge cases, incorrect conditions, async mistakes, off-by-one errors, and flawed application logic that unit tests might miss.
            </p>
          </div>

          <div className="card group hover:-translate-y-1">
            <div className="mb-6 w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] flex items-center justify-center group-hover:text-red-500 group-hover:border-red-200 transition-colors">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-xl font-bold mb-3">Security flaws</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Detect injection risks, unsafe input handling, secret exposure, authorization bypasses, and security-sensitive patterns.
            </p>
          </div>

          <div className="card group hover:-translate-y-1">
            <div className="mb-6 w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] flex items-center justify-center group-hover:text-orange-500 group-hover:border-orange-200 transition-colors">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-bold mb-3">Performance issues</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Identify inefficient queries (N+1), unnecessary React re-renders, memory leaks, and expensive loop operations.
            </p>
          </div>

          <div className="card group hover:-translate-y-1">
            <div className="mb-6 w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] flex items-center justify-center group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
              <Code2 size={20} />
            </div>
            <h3 className="text-xl font-bold mb-3">Code quality</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Improve readability, enforce consistency, ensure proper error handling, and elevate the overall maintainability of the codebase.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Review Experience ── */}
      <section className="section">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Reviews that explain themselves.</h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Kareixo doesn't just flag a line of code and leave you guessing. It explains why the issue matters, what the implications are, and gives you a drop-in suggested fix.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-[var(--text-secondary)] text-sm">
                <CheckCircle2 size={18} className="text-[var(--text-primary)] shrink-0" />
                <span><strong>Finding:</strong> Clear identification of the problem.</span>
              </li>
              <li className="flex gap-3 text-[var(--text-secondary)] text-sm">
                <CheckCircle2 size={18} className="text-[var(--text-primary)] shrink-0" />
                <span><strong>Rationale:</strong> Explanation of why this is considered an issue.</span>
              </li>
              <li className="flex gap-3 text-[var(--text-secondary)] text-sm">
                <CheckCircle2 size={18} className="text-[var(--text-primary)] shrink-0" />
                <span><strong>Severity:</strong> Categorized priority to help you triage.</span>
              </li>
              <li className="flex gap-3 text-[var(--text-secondary)] text-sm">
                <CheckCircle2 size={18} className="text-[var(--text-primary)] shrink-0" />
                <span><strong>Suggestion:</strong> Copy-pasteable code block to resolve it.</span>
              </li>
            </ul>
          </div>
          <div className="bg-[var(--bg-subtle)] border border-[var(--border-base)] rounded-2xl p-6 sm:p-8">
            <div className="space-y-6">
              <div className="border-l-2 border-red-500 pl-4 py-1">
                <h4 className="font-semibold text-red-600 mb-1">Security Issue</h4>
                <code className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-base)]">const query = `SELECT * FROM users WHERE id = '${"{"}userId{"}"}'`</code>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Why it matters</h4>
                <p className="text-sm text-[var(--text-secondary)]">Directly concatenating user input into a SQL string creates a critical SQL Injection vulnerability. An attacker can manipulate the `userId` parameter to execute arbitrary database commands.</p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Suggested fix</h4>
                <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-lg p-3 font-mono text-xs">
                  <div className="text-[var(--text-primary)]">const query = 'SELECT * FROM users WHERE id = $1';</div>
                  <div className="text-[var(--text-primary)]">const result = await db.query(query, [userId]);</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Transparency / Security ── */}
      <section id="security" className="section bg-[var(--bg-subtle)] border-y border-[var(--border-base)]">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Your code stays yours.</h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Kareixo is designed around privacy. Code diffs are used to generate reviews and are not retained as part of the review workflow.
            </p>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-1">No code storage</h4>
                <p className="text-sm text-[var(--text-secondary)]">We process the diff to generate the review and immediately discard it.</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">GitHub-native permissions</h4>
                <p className="text-sm text-[var(--text-secondary)]">The app only requests the minimum permissions required to read PRs and post comments.</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Secure webhooks</h4>
                <p className="text-sm text-[var(--text-secondary)]">All payloads are cryptographically verified to ensure they originated from GitHub.</p>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl p-8 h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6">AI review without the black box.</h2>
              <div className="flex flex-col gap-4 relative">
                <div className="absolute left-3 top-4 bottom-4 w-px bg-[var(--border-base)]"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--color-accent)]"></div>
                  <span className="font-medium">Finding identified</span>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--color-accent)]"></div>
                  <span className="font-medium">Why it matters explained</span>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--color-accent)]"></div>
                  <span className="font-medium">Evidence highlighted</span>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--color-accent)]"></div>
                  <span className="font-medium">Suggested fix generated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Free Forever & Chat ── */}
      <section className="section text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Powerful reviews. No pricing wall.</h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-16">
          Kareixo is built to stay accessible to developers. Reviews are routed across available AI capacity with automatic failover to ensure uptime.
        </p>

        <div className="max-w-3xl mx-auto bg-[var(--bg-subtle)] border border-[var(--border-base)] rounded-2xl p-8 md:p-12 text-left">
          <h3 className="text-2xl font-bold mb-4">
            And when you're not reviewing a PR,<br />
            <span className="text-[var(--text-muted)]">just ask Kareixo.</span>
          </h3>
          <p className="text-[var(--text-secondary)] mb-8">
            Use Kareixo Chat as a general-purpose AI assistant for development, debugging, and technical questions, powered by the same resilient routing.
          </p>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 mb-8">
            <div className="mb-4">
              <span className="font-medium text-sm">You</span>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Why is my Postgres query doing a sequential scan?</p>
            </div>
            <div>
              <span className="font-medium text-sm">Kareixo</span>
              <p className="text-sm text-[var(--text-secondary)] mt-1">A sequential scan usually occurs because an index is missing, or the planner determines the table is small enough that a full scan is faster than an index lookup...</p>
            </div>
          </div>
          <Link href="/chat" className="btn btn-secondary">
            Try Kareixo Chat
          </Link>
        </div>
      </section>

      {/* ── 9. Final CTA ── */}
      <section className="py-32 px-6 bg-[var(--bg-subtle)] border-t border-[var(--border-base)] text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Your next pull request<br />could already be better.
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10">
          Connect Kareixo to GitHub and let every pull request get a second pair of eyes. Free forever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/apps/kareixo-reviewer/installations/new"
            className="btn btn-primary h-12 px-8 text-base shadow-md w-full sm:w-auto"
          >
            Install on GitHub
          </a>
          <a
            href="https://github.com/karanray06/Kareixo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary h-12 px-8 text-base w-full sm:w-auto"
          >
            View source
          </a>
        </div>
      </section>

      {/* ── 10. Footer ── */}
      <footer className="py-12 border-t border-[var(--border-base)] bg-[var(--bg-surface)]">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <div className="w-5 h-5 bg-[var(--text-primary)] rounded flex items-center justify-center">
                <span className="text-[var(--bg-base)] text-[10px] font-bold font-mono">K</span>
              </div>
              Kareixo
            </div>
            <span className="text-[var(--text-muted)] text-sm">AI code review for GitHub.</span>
          </div>
          <div className="flex gap-6 flex-wrap justify-center text-sm font-medium text-[var(--text-secondary)]">
            <Link href="#product" className="hover:text-[var(--text-primary)] transition-colors">Product</Link>
            <Link href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it works</Link>
            <Link href="#security" className="hover:text-[var(--text-primary)] transition-colors">Security</Link>
            <Link href="/chat" className="hover:text-[var(--text-primary)] transition-colors">Kareixo Chat</Link>
            <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">
              GitHub
            </a>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 mt-8 pt-8 border-t border-[var(--border-base)] text-sm text-[var(--text-muted)] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Kareixo</span>
          <span>Open source &middot; MIT</span>
        </div>
      </footer>
    </main>
  );
}
