# Kareixo - The Glass Box IDE

Kareixo is a browser-based AI coding environment designed with two core principles:
1. **Free Forever:** Routes across free-tier LLM providers (OpenRouter, NVIDIA, Z.AI, Cloudflare, Groq).
2. **Transparent:** The "Glass Box" model. See exactly what the AI thinks, watch the diffs, and review automated security passes before any change is applied.

## Core Features

- **Multi-Model Routing:** Automatically load-balances across top free models (DeepSeek, Llama 3, Qwen) using a smart round-robin router with automatic failover.
- **4-Step Transparency:** 
  1. Agent reasoning ("Explain mode")
  2. Live inline diffing
  3. Pre-commit security scanning (secrets, injection, eval)
  4. Explicit user approval
- **Web-First IDE:** Monaco editor, xterm.js terminal, and WebContainer support (V2).

## Tech Stack

- **Framework:** Next.js 16 (React 19, App Router)
- **Styling:** Tailwind CSS v4 (native `@theme` variables)
- **3D Graphics:** Three.js & React Three Fiber
- **Auth:** Auth.js (NextAuth v5)
- **Database:** Neon Serverless Postgres + Drizzle ORM
- **AI Integration:** Vercel AI SDK

## Setup Instructions

1. Clone the repository and install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy the environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Set up your database and API keys in `.env.local`.

4. Generate the database schema and push to Neon:
   \`\`\`bash
   npm run db:generate
   npm run db:push
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Design System

The application uses a custom design token system in Tailwind v4 (`src/app/globals.css`). It completely overrides default Tailwind colors with a bespoke "glassmorphism" aesthetic (Deep Graphite + Neon Cyan + Amber accents).

## License
MIT
