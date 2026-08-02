import { generateText } from "ai";
import { router } from "./src/lib/model-router";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testAI() {
  console.log("Testing AI Router Connection...");
  console.log("--------------------------------");

  try {
    const { result, provider } = await router.executeWithFailover(async (provider) => {
      console.log(`Attempting to use provider: ${provider.name}`);
      const response = await generateText({
        model: provider.model,
        prompt: "Say 'Hello, your API keys are working perfectly!' if you can read this.",
      });
      return { text: response.text, provider };
    });

    console.log("\n✅ SUCCESS!");
    console.log(`Model used: ${provider.name}`);
    console.log(`Response: ${result.text}`);
  } catch (error) {
    console.error("\n❌ FAILED!");
    console.error("No providers worked. Check your API keys in .env.local.");
    console.error(error);
  }
}

testAI();
