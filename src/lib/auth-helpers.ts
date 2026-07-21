import { auth } from "@/auth";

/**
 * Ensures a valid session exists for API routes.
 * @returns The active session if authenticated.
 * @throws Error if unauthorized.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
