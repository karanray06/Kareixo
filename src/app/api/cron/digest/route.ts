import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { github_installations, repositories, reviews } from "@/db/schema";
import { gte, eq } from "drizzle-orm";

// This route is called by Vercel Cron.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    
    // Last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const recentReviews = await db.select({
      review: reviews,
      repo: repositories,
      install: github_installations
    })
    .from(reviews)
    .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
    .innerJoin(github_installations, eq(repositories.installationId, github_installations.installationId))
    .where(gte(reviews.createdAt, yesterday));

    // Group by installation
    const installationsMap = new Map<number, { install: any, reviews: any[] }>();
    for (const row of recentReviews) {
      if (!row.install.digestWebhookUrl) continue;
      
      if (!installationsMap.has(row.install.installationId)) {
        installationsMap.set(row.install.installationId, { install: row.install, reviews: [] });
      }
      installationsMap.get(row.install.installationId)!.reviews.push(row);
    }

    const results = [];

    for (const [_, data] of installationsMap.entries()) {
      const { install, reviews } = data;
      const webhookUrl = install.digestWebhookUrl;

      const totalReviews = reviews.length;
      const failedReviews = reviews.filter(r => r.review.status === 'failed').length;
      const totalFindings = reviews.reduce((acc, r) => acc + (r.review.findingCount || 0), 0);

      const message = {
        content: `📊 **Kareixo Daily Digest** for ${install.accountLogin}`,
        embeds: [
          {
            title: "Code Review Activity (Last 24h)",
            color: 3447003,
            fields: [
              { name: "Reviews Completed", value: `${totalReviews - failedReviews}`, inline: true },
              { name: "Reviews Failed", value: `${failedReviews}`, inline: true },
              { name: "Issues Flagged", value: `${totalFindings}`, inline: true }
            ]
          }
        ]
      };

      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message)
        });
        results.push({ installation: install.accountLogin, success: res.ok });
      } catch (err) {
        console.error(`Failed to send digest to ${install.accountLogin}`, err);
        results.push({ installation: install.accountLogin, success: false });
      }
    }

    return NextResponse.json({ success: true, processed: installationsMap.size, results });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
