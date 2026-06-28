import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  provider: text("provider"), // e.g. 'github', 'google', 'credentials'
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  path: text("path").notNull(), // e.g. '/src/index.js'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/** Persisted per-provider quota state — survives cold starts & is shared across instances */
export const providerStats = pgTable("provider_stats", {
  providerName: text("provider_name").primaryKey(),
  requestsToday: integer("requests_today").notNull().default(0),
  rateLimitHits: integer("rate_limit_hits").notNull().default(0),
  lastRateLimitAt: timestamp("last_rate_limit_at"),
  lastRequestAt: timestamp("last_request_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
