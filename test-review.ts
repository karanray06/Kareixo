import "dotenv/config";
import { generateObject } from "ai";
import { z } from "zod";
import { router } from "./src/lib/model-router";

const ReviewOutputSchema = z.object({
  findings: z.array(
    z.object({
      path: z.string().describe("The file path of the finding."),
      line: z.number().describe("The line number in the patched file."),
      severity: z.string().describe("High, Medium, or Low."),
      category: z.string().describe("Logic, Security, Performance, or Style."),
      comment: z.string().describe("The actual review comment text to post."),
    })
  ),
  summary: z.string().describe("A high-level summary of the review."),
});

const diffContext = `
diff --git a/src/index.js b/src/index.js
index 83a0029..8e7c126 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,5 +1,6 @@
 function login(username, password) {
-    if (username === "admin" && password === "12345") {
+    const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
+    if (db.query(sql)) {
         return true;
     }
     return false;
 }
`;

async function testReview() {
  console.log("Testing AI Code Review Generator (Structured Output)...");
  console.log("--------------------------------");

  try {
    const { result, provider } = await router.executeWithFailover(async (provider) => {
      const response = await generateObject({
        model: provider.model,
        system: "You are an expert code reviewer. Analyze the diff and flag any security flaws. Return structured JSON.",
        prompt: `Diff:\n${diffContext}`,
        schema: ReviewOutputSchema,
      });
      return response.object;
    }, "chat", "fast");

    console.log("\n✅ SUCCESS!");
    console.log("Model used:", provider.modelName);
    console.log("Summary:", result.summary);
    console.log("Findings:");
    result.findings.forEach(f => {
      console.log(`  - [${f.severity}] ${f.path}:${f.line} -> ${f.comment}`);
    });
  } catch (error: any) {
    console.error("\n❌ FAILED!");
    console.error(error.message || error);
  }
}

testReview();
