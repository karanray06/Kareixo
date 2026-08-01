import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

/**
 * Returns an Octokit client authenticated as a specific GitHub App installation.
 * This handles JWT signing and installation-token exchange via @octokit/auth-app.
 */
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error(
      "[github-app] Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY environment variables."
    );
  }

  const auth = createAppAuth({
    appId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    installationId,
  });

  const { token } = await auth({ type: "installation" });
  return new Octokit({ auth: token });
}
