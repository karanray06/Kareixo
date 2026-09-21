# Kareixo

**Kareixo** is an AST-Native Autonomous CI/CD Agent that reviews pull requests, detects bugs at the line level, self-heals failing tests, and runs visual QA — all powered by multi-model AI routing with automatic failover.

Built on Next.js 16 with the App Router, Kareixo goes beyond simple code review to provide:

- **AST-Bounded Code Generation** — zero-syntax-hallucination patches using tree-sitter
- **Probabilistic Bug Heatmaps** — line-level defect probability scoring
- **Self-Healing CI** — automatically fixes failing tests in sandboxed E2B microVMs
- **Visual QA** — browser-based UI regression detection via Figranium
- **Multi-Model Routing** — Gemini, Groq, NVIDIA NIM (GLM-5.3), Pollinations with automatic failover

---

## Core Features

### 🔍 Automated PR Review
- Webhook-driven reviews triggered on PR open/synchronize
- Inline GitHub review comments with severity and category
- Configurable review categories per repository
- Monetization cap enforcement (50 reviews/month on free tier)

### 🧬 AST-Bounded Generation (Zero-Syntax-Hallucination)
- Parses code into Concrete Syntax Trees using **web-tree-sitter** (WASM)
- Extracts error/suspect nodes with byte-range precision
- Constrains the LLM to produce structured `NodeMutation[]` JSON
- Deterministically stitches patches via string-splice at byte offsets
- Re-parses to validate — rejects any patch with syntax errors

### 🔥 Probabilistic Bug Heatmap
- LLM evaluates code and returns per-line defect probabilities (0.0–1.0)
- Lines scored by severity: critical, high, medium, low
- Categorized: logic, security, performance, race condition, null reference, etc.
- Premium UI with pulsing red/orange glow for high-risk lines
- Click any line to reveal the defect explanation

### 🔧 Self-Healing CI (Auto-Heal Loop)
- Triggered by GitHub `check_run` failures
- Boots an **E2B Firecracker microVM** sandbox
- Clones the repo, confirms test failure, identifies failing file
- Generates AST-bounded patches via LLM (max 3 attempts)
- Validates patches with tree-sitter re-parse
- On success: auto-commits the fix with `[Kareixo Auto-Heal] Verified fix applied`
- On failure: posts a detailed comment explaining what was tried

### 🖥️ Live Sandboxed PR Testing
- E2B sandbox execution for `deep` tier repositories
- Clones the PR branch, runs `npm install` + `npm test`
- Auto-detects npm/yarn/pnpm from lockfiles
- Pipes test results into the AI review for context-aware feedback
- Adds "🧪 Sandbox Verified" badge to reviews

### 📊 Live Review Dashboard
- Real-time pipeline visualization with polling
- Animated timeline showing each review step
- Sandbox terminal output with expandable stdout/stderr
- AI summary card with provider attribution
- Pulsing "● LIVE" indicator for active pipelines

### 🌐 Visual QA (Figranium Integration)
- Browser automation against PR preview URLs
- Captures screenshots, DOM snapshots, console errors, network failures
- LLM-powered visual regression analysis
- Structured output with severity, location, and fix suggestions

### 💬 CodeChat — AI Coding Assistant
- Real-time streaming chat with repository context
- Tool-augmented: read files, search code, propose changes
- Multi-provider: Gemini, Groq, GLM-5.3 (NVIDIA NIM), Pollinations
- Conversation persistence with history

### 🛡️ Multi-Model Router
- Task-based key routing (chat vs. code keys)
- Automatic failover: Gemini → Groq → Pollinations
- Per-attempt timeout with circuit breaker
- Rate limit detection and cooldown management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Frontend | React 19, Tailwind CSS v4, Framer Motion |
| Auth | Auth.js (NextAuth v5) |
| Database | Neon Serverless Postgres + Drizzle ORM |
| GitHub | GitHub App, Webhooks, Octokit |
| AI | Vercel AI SDK, Gemini, Groq, NVIDIA NIM, Pollinations |
| AST | web-tree-sitter (WASM), tree-sitter-wasms |
| Sandbox | E2B (Firecracker microVMs) |
| Visual QA | Figranium (browser automation) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── codechat/          — AI coding assistant API
│   │   ├── heatmap/           — Bug heatmap analysis API
│   │   ├── reviews/[id]/pipeline/ — Live review pipeline status
│   │   ├── webhooks/
│   │   │   ├── github/        — PR + check_run webhooks
│   │   │   └── ci-fail/       — CI failure auto-heal webhook
│   │   └── ...
│   ├── dashboard/
│   │   ├── heatmap/           — Bug heatmap viewer page
│   │   ├── live-review/       — Live pipeline dashboard page
│   │   └── ...
│   └── codechat/              — CodeChat UI
├── components/
│   └── dashboard/
│       ├── HeatmapCodeViewer.tsx   — Heatmap component
│       └── LiveReviewDashboard.tsx — Pipeline visualizer
├── lib/
│   ├── ast/
│   │   ├── parser.ts          — Tree-sitter WASM parser
│   │   ├── mutation.ts        — AST mutation engine
│   │   └── prompt.ts          — LLM prompt builder
│   ├── providers/
│   │   ├── gemini.ts
│   │   ├── groq.ts
│   │   ├── nvidia-nim.ts      — NVIDIA NIM (GLM-5.3)
│   │   └── pollinations.ts
│   ├── model-router.ts        — Multi-model router with failover
│   ├── review-generator.ts    — PR review pipeline
│   ├── sandbox-executor.ts    — E2B sandbox execution
│   ├── healing-loop.ts        — Self-healing CI engine
│   ├── heatmap-analyzer.ts    — Defect probability scorer
│   ├── figranium-service.ts   — Visual QA service
│   └── pipeline-events.ts     — Real-time pipeline event store
└── __tests__/                 — Test suite
```

---

## Local Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/your-org/kareixo.git
   cd kareixo
   npm install
   ```
   > The `postinstall` script automatically copies tree-sitter WASM grammars to `public/grammars/`.

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in `.env.local`** — see [Environment Variables](#environment-variables) below.

4. **Generate and push database schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | ✅ | NextAuth session encryption secret |
| `NEXTAUTH_URL` | ✅ | App URL (`http://localhost:3000` for dev) |
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `AUTH_GITHUB_ID` | ✅ | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | ✅ | GitHub OAuth App Client Secret |
| `GITHUB_APP_ID` | ✅ | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | ✅ | GitHub App private key (PEM format) |
| `GITHUB_WEBHOOK_SECRET` | ✅ | GitHub webhook signature secret |
| `GEMINI_API_KEY_CHAT` | ✅ | Gemini API key for chat tasks |
| `GEMINI_API_KEY_CODE` | ✅ | Gemini API key for code tasks |
| `POLLINATIONS_API_KEY` | ✅ | Pollinations API key (fallback provider) |
| `GROQ_API_KEY` | ⚡ | Groq API key (optional provider) |
| `NVIDIA_NIM_API_KEY` | ⚡ | NVIDIA NIM API key for GLM-5.3 |
| `E2B_API_KEY` | ⚡ | E2B API key for sandbox execution |
| `FIGRANIUM_API_URL` | ⚡ | Figranium base URL (default: `http://localhost:3001`) |
| `FIGRANIUM_API_KEY` | ⚡ | Figranium API key |

> ✅ = Required for core functionality | ⚡ = Optional (enables additional features)

---

## GitHub App Setup

1. Create a GitHub App in **Settings → Developer settings → GitHub Apps**
2. Set webhook URL: `https://your-domain/api/webhooks/github`
3. Subscribe to events:
   - `installation`
   - `installation_repositories`
   - `pull_request`
   - `check_run` ← (required for auto-healing)
4. Set Setup URL: `https://your-domain/api/github/setup`
5. Enable **"Redirect on update"**

---

## Deployment (Vercel)

Kareixo is designed to run on Vercel. Set all environment variables in **Vercel → Settings → Environment Variables**, then deploy.

```bash
vercel --prod
```

---

## License

MIT
