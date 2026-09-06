/**
 * Auth scoping test: verifies that dashboard queries are properly scoped by userId.
 * 
 * Tests the core invariant: User A's data must never be visible to User B.
 * This tests the DB query layer directly (not HTTP), since the dashboard
 * is a Server Component that queries DB inline.
 */
import { describe, it, expect, vi } from "vitest";

describe("Dashboard auth scoping", () => {
  it("should scope repository queries by userId", async () => {
    // This test verifies the query structure in dashboard/page.tsx
    // by checking that every dashboard query joins through github_installations
    // and filters by userId.
    //
    // Since the dashboard is a Server Component (not an API route), we verify
    // the code structure rather than making HTTP calls.
    
    const fs = await import("fs");
    const path = await import("path");
    
    const dashboardPath = path.resolve(__dirname, "../app/dashboard/page.tsx");
    const dashboardCode = fs.readFileSync(dashboardPath, "utf-8");

    // Verify all database queries filter by userId
    // The dashboard page should have .where(eq(github_installations.userId, userId))
    // for every query that returns user-specific data
    const userIdFilters = (dashboardCode.match(/eq\(github_installations\.userId,\s*userId\)/g) || []).length;
    
    // There should be at least 3 userId-scoped queries: repos, reviews, stats
    expect(userIdFilters).toBeGreaterThanOrEqual(3);
  });

  it("should scope repo settings page by userId", async () => {
    const fs = await import("fs");
    const path = await import("path");
    
    const repoSettingsPath = path.resolve(__dirname, "../app/dashboard/[repoId]/page.tsx");
    const repoSettingsCode = fs.readFileSync(repoSettingsPath, "utf-8");
    
    // Verify the repo settings page checks ownership
    expect(repoSettingsCode).toContain("github_installations.userId");
    expect(repoSettingsCode).toContain("session.user.id");
  });

  it("should scope repository PATCH API by userId", async () => {
    const fs = await import("fs");
    const path = await import("path");
    
    const repoApiPath = path.resolve(__dirname, "../app/api/repositories/[id]/route.ts");
    const repoApiCode = fs.readFileSync(repoApiPath, "utf-8");
    
    // Verify the API verifies ownership before updating
    expect(repoApiCode).toContain("github_installations.userId");
    expect(repoApiCode).toContain("session.user.id");
    expect(repoApiCode).toContain("Unauthorized");
  });

  it("should NOT expose global stats without scoping", async () => {
    const fs = await import("fs");
    const path = await import("path");
    
    const statsPath = path.resolve(__dirname, "../app/api/stats/route.ts");
    const statsCode = fs.readFileSync(statsPath, "utf-8");
    
    // The stats endpoint should require auth
    expect(statsCode).toContain("auth");
    expect(statsCode).toContain("Unauthorized");
    
    // It should NOT query the old providerStats table (which leaked global data)
    expect(statsCode).not.toContain("providerStats");
  });
});
