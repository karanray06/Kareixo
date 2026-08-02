# Kareixo

Kareixo is an AI-powered GitHub code review assistant. Install it on your repositories, and every time a pull request is opened or updated, Kareixo analyzes the diff, generates actionable review comments, and posts them back to GitHub.

The product is designed around two principles:

1. **Free Forever** — route reviews across free-tier LLM providers and fail over automatically when one is rate-limited.
2. **Transparent Review** — show the findings, rationale, and review history in a simple dashboard instead of hiding everything behind a black box.

## What Kareixo does

- Reviews pull requests automatically when the GitHub App is installed.
- Detects logic issues, security flaws, performance concerns, and style improvements.
- Posts inline review comments and a summary review back to GitHub.
- Stores review results in a database and surfaces them in a dashboard.
- Links GitHub App installations to signed-in users so each account only sees its own data.

## Core features

- **GitHub App integration** — install on repos or organizations with a one-click setup flow.
- **Webhook-driven reviews** — listens for new PRs and synchronize events.
- **Multi-model routing** — uses a resilient model router with automatic provider failover.
- **Review dashboard** — shows connected repositories and recent review activity.
- **Protected auth flow** — dashboard access is guarded by both page-level checks and middleware.

## Tech stack

- **Framework:** Next.js 16 with the App Router
- **Frontend:** React 19, Tailwind CSS v4
- **Auth:** Auth.js (NextAuth v5)
- **Database:** Neon Serverless Postgres + Drizzle ORM
- **GitHub integration:** GitHub App, webhooks, Octokit
- **AI layer:** Vercel AI SDK with provider routing

## Project structure

- `src/app/api/webhooks/github/route.ts` — handles GitHub webhooks for installs and PR events
- `src/app/api/github/setup/route.ts` — links an installation to the signed-in user after app install
- `src/lib/review-generator.ts` — generates and posts PR reviews
- `src/app/dashboard/page.tsx` — shows repos and review history for the current user
- `src/lib/providers/` — provider adapters for OpenRouter, NVIDIA, Groq, Cloudflare, Moonshot, Z.AI, and more

## Local development

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

   If `.env.example` is not present, create `.env.local` manually with the variables below.

3. Fill in the required environment variables in `.env.local`:

   ```env
   DATABASE_URL=your_neon_postgres_url
   AUTH_SECRET=your_auth_secret
   AUTH_GITHUB_ID=your_github_oauth_client_id
   AUTH_GITHUB_SECRET=your_github_oauth_client_secret
   NEXTAUTH_URL=http://localhost:3000
   GITHUB_APP_ID=your_github_app_id
   GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   OPENROUTER_API_KEY=optional
   NVIDIA_API_KEY=optional
   GROQ_API_KEY=optional
   ZAI_API_KEY=optional
   CLOUDFLARE_ACCOUNT_ID=optional
   CLOUDFLARE_API_TOKEN=optional
   MOONSHOT_API_KEY=optional
   ```

4. Generate and push the database schema:

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## GitHub App setup

To make the install flow and dashboard work correctly:

1. Create or open a GitHub App in GitHub Settings → Developer settings → GitHub Apps.
2. Set the webhook URL to your deployed app endpoint, such as:
   - `https://your-domain/api/webhooks/github`
3. Subscribe to these events:
   - `installation`
   - `installation_repositories`
   - `pull_request`
4. In the app settings, set the Setup URL to:
   - Production: `https://kareixo.vercel.app/api/github/setup`
   - Local development: `http://localhost:3000/api/github/setup`
5. Enable "Redirect on update" so reinstall and permission changes also hit the setup callback.

The setup callback links the GitHub installation ID to the signed-in user so the dashboard only shows repositories and reviews for the correct account.

## Dashboard security

The dashboard is protected in two layers:

- The page component redirects signed-out users to `/login` with a callback URL.
- Middleware also blocks unauthenticated access to `/dashboard` as a backstop.

## Deployment

Kareixo is designed to run on Vercel. In production, make sure you configure the same environment variables as above and point your GitHub App webhook and setup URL to your deployed app.

## License

MIT
