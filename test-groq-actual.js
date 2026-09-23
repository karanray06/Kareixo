const { createGroq } = require("@ai-sdk/groq");
const { streamText } = require("ai");
require("dotenv").config({ path: ".env.local" });

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroqToolsStream() {
  try {
    const res = await streamText({
      model: groq("openai/gpt-oss-20b"),
      messages: [{ role: "user", content: "read the docker-compose.yml file" }],
      tools: {
        readFile: {
          description: "Read a file from the repository.",
          parameters: require("zod").object({
            path: require("zod").string()
          }),
          execute: async ({ path }) => {
            return { content: "mock content" };
          }
        }
      }
    });
    
    for await (const chunk of res.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\nSuccess!");
  } catch (err) {
    console.error(err);
  }
}

testGroqToolsStream();
