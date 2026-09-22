const { generateText } = require('ai');
const { createOpenAICompatible } = require('@ai-sdk/openai-compatible');

const apiKey = process.env.NVIDIA_NIM_API_KEY || "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";

const nim = createOpenAICompatible({
  name: "nvidia-nim",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

async function main() {
  console.log("Testing Kimi...");
  try {
    const res = await generateText({
      model: nim('moonshotai/kimi-k3'),
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Kimi response:", res.text);
  } catch(e) {
    console.log("Kimi error:", e.message, e);
  }

  console.log("Testing Mistral...");
  try {
    const res2 = await generateText({
      model: nim('mistralai/mistral-nemotron'),
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Mistral response:", res2.text);
  } catch(e) {
    console.log("Mistral error:", e.message, e);
  }
}

main();
