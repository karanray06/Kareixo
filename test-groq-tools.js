const { createGroq } = require("@ai-sdk/groq");
const { generateText } = require("ai");

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "" // Will test in next step
});

async function testGroqTools() {
  try {
    const res = await generateText({
      model: groq("llama3-8b-8192"),
      messages: [{ role: "user", content: "read the docker-compose.yml file" }],
      tools: {
        readFile: {
          description: "Read a file from the repository.",
          parameters: {
            type: "object",
            properties: {
              path: { type: "string" }
            },
            required: ["path"]
          },
          execute: async ({ path }) => {
            return { content: "mock content" };
          }
        }
      }
    });
    console.log("Success!", res.toolCalls);
  } catch (err) {
    console.error(err);
  }
}

testGroqTools();
