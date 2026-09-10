const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "../src/app/dashboard/page.tsx");
let content = fs.readFileSync(pagePath, "utf-8");

// 1. Add "use client" and imports
content = content.replace(
  `export default function DashboardOverview() {`,
  `"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/repositories")
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/repositories/sync", { method: "POST" });
      const res = await fetch("/api/repositories");
      const json = await res.json();
      setData(json);
    } finally {
      setSyncing(false);
    }
  };
`
);

// 2. Replace hardcoded greeting
content = content.replace(
  `Good evening, Karan.`,
  `Good evening, {session?.user?.name?.split(' ')[0] || 'User'}.`
);
content = content.replace(
  `12 REPOSITORIES MONITORED`,
  `{data?.repositories?.length || 0} REPOSITORIES MONITORED`
);
content = content.replace(
  `12 connected repositories`,
  `{data?.repositories?.length || 0} connected repositories`
);

// 3. Sync button onClick
content = content.replace(
  `id="sync-btn"`,
  `id="sync-btn" onClick={handleSync} disabled={syncing}`
);
content = content.replace(
  `<span>Sync Repositories</span>`,
  `<span>{syncing ? "Syncing..." : "Sync Repositories"}</span>`
);

// 4. Add Repository button href
content = content.replace(
  `<button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui shadow-sm hover:opacity-90 active:scale-95 transition-all">`,
  `<a href="https://github.com/apps/kareixo-reviewer/installations/new" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui shadow-sm hover:opacity-90 active:scale-95 transition-all">`
);
content = content.replace(
  `<span>Add Repository</span>
</button>`,
  `<span>Add Repository</span>
</a>`
);

// 5. Replace stats
content = content.replace(
  `<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">48</span>`,
  `<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">{data?.stats?.totalReviews || 0}</span>`
);
content = content.replace(
  `<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">36</span>`,
  `<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">{data?.stats?.passedClean || 0}</span>`
);
content = content.replace(
  `75.0% pass rate`,
  `{data?.stats?.totalReviews ? Math.round((data?.stats?.passedClean / data.stats.totalReviews) * 100) : 0}% pass rate`
);
content = content.replace(
  `style={{ width: "75%" }}`,
  `style={{ width: \`\${data?.stats?.totalReviews ? Math.round((data?.stats?.passedClean / data.stats.totalReviews) * 100) : 0}%\` }}`
);
content = content.replace(
  `<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">9</span>`,
  `<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">{data?.stats?.activeFindings || 0}</span>`
);
content = content.replace(
  `18<span className="font-body-base text-base font-normal text-text-secondary">s</span>`,
  `{data?.stats?.avgReviewTime || "0s"}`
);

fs.writeFileSync(pagePath, content);
console.log("Updated page.tsx");
