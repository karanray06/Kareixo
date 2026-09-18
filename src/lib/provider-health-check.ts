import { GROQ_MODEL_CATALOG } from "./providers/groq";
import { POLLINATIONS_MODEL_CATALOG } from "./providers/pollinations";

export async function checkModelAvailability() {
  const results: Record<string, boolean> = {};

  // Groq: list available models and check ours are present
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    });
    if (groqRes.ok) {
      const groqModels = (await groqRes.json()).data?.map((m: any) => m.id) ?? [];
      for (const m of GROQ_MODEL_CATALOG) results[`groq:${m.modelId}`] = groqModels.includes(m.modelId);
    } else {
      for (const m of GROQ_MODEL_CATALOG) results[`groq:${m.modelId}`] = false;
    }
  } catch (e) {
    for (const m of GROQ_MODEL_CATALOG) results[`groq:${m.modelId}`] = false;
  }

  // Pollinations: list available models
  try {
    const polliRes = await fetch("https://text.pollinations.ai/models");
    if (polliRes.ok) {
      const polliModels = (await polliRes.json())?.map((m: any) => m.name) ?? [];
      for (const m of POLLINATIONS_MODEL_CATALOG) results[`pollinations:${m.modelId}`] = polliModels.includes(m.modelId);
    } else {
      for (const m of POLLINATIONS_MODEL_CATALOG) results[`pollinations:${m.modelId}`] = false;
    }
  } catch (e) {
    for (const m of POLLINATIONS_MODEL_CATALOG) results[`pollinations:${m.modelId}`] = false;
  }

  return results;
}
