// Full schema creation for fresh Neon DB
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    email text NOT NULL UNIQUE,
    password_hash text,
    provider text,
    plan text NOT NULL DEFAULT 'free',
    created_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS github_installations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    installation_id integer NOT NULL UNIQUE,
    account_login text NOT NULL,
    digest_webhook_url text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS repositories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id integer NOT NULL REFERENCES github_installations(installation_id),
    github_repo_id integer NOT NULL,
    full_name text NOT NULL,
    enabled_categories text NOT NULL DEFAULT '["logic", "security", "style"]',
    preferred_tier text NOT NULL DEFAULT 'fast',
    custom_instructions text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id uuid NOT NULL REFERENCES repositories(id),
    pr_number integer NOT NULL,
    status text NOT NULL,
    summary text,
    finding_count integer DEFAULT 0,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id uuid NOT NULL REFERENCES repositories(id),
    pr_number integer NOT NULL,
    comment_id integer,
    signal text NOT NULL,
    created_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS provider_stats (
    provider_name text PRIMARY KEY,
    requests_today integer NOT NULL DEFAULT 0,
    stats_date text,
    rate_limit_hits integer NOT NULL DEFAULT 0,
    last_rate_limit_at timestamp,
    last_request_at timestamp,
    updated_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    title text NOT NULL DEFAULT 'New Conversation',
    repo_full_name text,
    branch text,
    preloaded_context text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES chat_conversations(id),
    role text NOT NULL,
    content text NOT NULL,
    model text,
    created_at timestamp DEFAULT now()
  )`,
];

(async () => {
  for (const query of tables) {
    const tableName = query.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    console.log(`Creating: ${tableName}...`);
    await sql.query(query);
    console.log(`  ✓ ${tableName}`);
  }
  console.log("\n✅ All tables created!");
})().catch((e) => console.error("Failed:", e.message));
