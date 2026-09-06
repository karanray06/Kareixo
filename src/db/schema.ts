import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  provider: text("provider"), // e.g. 'github', 'google', 'credentials'
  plan: text("plan").notNull().default("free"), // "free", "pro", "team"
  createdAt: timestamp("created_at").defaultNow(),
});

export const github_installations = pgTable("github_installations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id), // nullable — webhook creates before user links
  installationId: integer("installation_id").notNull().unique(),
  accountLogin: text("account_login").notNull(), // GitHub account login from webhook
  digestWebhookUrl: text("digest_webhook_url"), // For Slack/Discord digests
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repositories = pgTable("repositories", {
  id: uuid("id").primaryKey().defaultRandom(),
  installationId: integer("installation_id").references(() => github_installations.installationId).notNull(),
  githubRepoId: integer("github_repo_id").notNull(),
  fullName: text("full_name").notNull(), // e.g. owner/repo
  enabledCategories: text("enabled_categories").notNull().default('["logic", "security", "style"]'), // JSON string array
  preferredTier: text("preferred_tier").notNull().default('fast'), // "deep" or "fast"
  customInstructions: text("custom_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id").references(() => repositories.id).notNull(),
  prNumber: integer("pr_number").notNull(),
  status: text("status").notNull(), // "pending", "completed", "failed"
  summary: text("summary"),
  findingCount: integer("finding_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id").references(() => repositories.id).notNull(),
  prNumber: integer("pr_number").notNull(),
  commentId: integer("comment_id"), // GitHub comment ID
  signal: text("signal").notNull(), // "useful", "not-useful"
  createdAt: timestamp("created_at").defaultNow(),
});

/** Persisted per-provider quota state — survives cold starts & is shared across instances */
export const providerStats = pgTable("provider_stats", {
  providerName: text("provider_name").primaryKey(),
  requestsToday: integer("requests_today").notNull().default(0),
  statsDate: text("stats_date"), // YYYY-MM-DD for daily resets
  rateLimitHits: integer("rate_limit_hits").notNull().default(0),
  lastRateLimitAt: timestamp("last_rate_limit_at"),
  lastRequestAt: timestamp("last_request_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull().default("New Conversation"),
  repoFullName: text("repo_full_name"), // e.g. "owner/repo" — null for general chat
  branch: text("branch"),               // optional branch context
  preloadedContext: text("preloaded_context"), // JSON context for incident tracer handoff
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => chatConversations.id).notNull(),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  model: text("model"), // track which NVIDIA model answered
  createdAt: timestamp("created_at").defaultNow(),
});
