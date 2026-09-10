const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "../src/app/dashboard/[repoId]/page.tsx");
let content = fs.readFileSync(pagePath, "utf-8");

// 1. Add "use client" and imports
content = content.replace(
  `export default function RepositoryDetails({ params }: { params: { repoId: string } }) {`,
  `"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";

export default function RepositoryDetails({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = use(params);
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(\`/api/repositories/\${repoId}\`)
      .then(res => res.json())
      .then(json => setData(json));
  }, [repoId]);
`
);

// 2. Replace hardcoded repo name
content = content.replace(
  `<span className="text-text-secondary font-medium">karanray06</span>`,
  `<span className="text-text-secondary font-medium">{data?.repository?.fullName?.split('/')[0] || "owner"}</span>`
);
content = content.replace(
  `<span className="font-semibold text-text-primary">api-service</span>`,
  `<span className="font-semibold text-text-primary">{data?.repository?.fullName?.split('/')[1] || "repo"}</span>`
);

// 3. Replace stats
content = content.replace(
  `<span className="font-title-card text-title-card font-semibold text-text-primary">124</span>`,
  `<span className="font-title-card text-title-card font-semibold text-text-primary">{data?.stats?.totalReviews || 0}</span>`
);
content = content.replace(
  `<span className="font-title-card text-title-card font-semibold text-warning">3</span>`,
  `<span className="font-title-card text-title-card font-semibold text-warning">{data?.stats?.activeFindings || 0}</span>`
);
content = content.replace(
  `<span className="font-title-card text-title-card font-semibold text-text-primary">88.2%</span>`,
  `<span className="font-title-card text-title-card font-semibold text-text-primary">{data?.stats?.totalReviews ? Math.round((data?.stats?.passedClean / data.stats.totalReviews) * 100) : 0}%</span>`
);

// 4. Open GitHub link
content = content.replace(
  `href="https://github.com"`,
  `href={\`https://github.com/\${data?.repository?.fullName || ""}\`}`
);

fs.writeFileSync(pagePath, content);
console.log("Updated repo details top section.");
