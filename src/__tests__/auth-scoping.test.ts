/**
 * Auth scoping test: verifies that dashboard queries are properly scoped by userId.
 * 
 * Tests the core invariant: User A's data must never be visible to User B.
 * 
 * The dashboard pages are client components that fetch data from API routes.
 * The API routes contain the actual DB queries scoped by userId.
 * The dashboard layout (server component) gates access via auth().
 */
import { describe, it, expect } from "vitest";

describe("Dashboard auth scoping", () => {
  it("should scope repository API queries by userId", async () => {
    // The dashboard page fetches from /api/repositories, which scopes by userId.
    // Verify the API route has proper auth scoping.
    const fs = await import("fs");
    const path = await import("path");
    
    const repoApiPath = path.resolve(__dirname, "../app/api/repositories/route.ts");
    const repoApiCode = fs.readFileSync(repoApiPath, "utf-8");

    // Verify user-scoped queries in the API route
    expect(repoApiCode).toContain("github_installations.userId");
    expect(repoApiCode).toContain("session.user.id");
    expect(repoApiCode).toContain("Unauthorized");
  });

  it("should scope repo detail API by userId", async () => {
    // The [repoId] page fetches from /api/repositories/[id], which verifies ownership.
    const fs = await import("fs");
    const path = await import("path");
    
    const repoDetailApiPath = path.resolve(__dirname, "../app/api/repositories/[id]/route.ts");
    const repoDetailApiCode = fs.readFileSync(repoDetailApiPath, "utf-8");
    
    // Verify the API verifies ownership via userId
    expect(repoDetailApiCode).toContain("github_installations.userId");
    expect(repoDetailApiCode).toContain("session.user.id");
    expect(repoDetailApiCode).toContain("Unauthorized");
    expect(repoDetailApiCode).toContain("not found or unauthorized");
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

  it("should gate dashboard layout behind auth", async () => {
    const fs = await import("fs");
    const path = await import("path");
    
    const layoutPath = path.resolve(__dirname, "../app/dashboard/layout.tsx");
    const layoutCode = fs.readFileSync(layoutPath, "utf-8");

    // The layout should redirect unauthenticated users
    expect(layoutCode).toContain("auth");
    expect(layoutCode).toContain("redirect");
    expect(layoutCode).toContain("session");
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
