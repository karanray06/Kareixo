import { NextResponse } from "next/server";

export async function GET() {
  const missing = [];
  
  if (!process.env.NVIDIA_NIM_KIMI_API_KEY) missing.push("NVIDIA_NIM_KIMI_API_KEY");
  if (!process.env.NVIDIA_NIM_MISTRAL_API_KEY) missing.push("NVIDIA_NIM_MISTRAL_API_KEY");
  if (!process.env.GROQ_API_KEY) missing.push("GROQ_API_KEY");
  
  if (missing.length > 0) {
    console.error("[Health Check] Missing API Keys:", missing.join(", "));
    return NextResponse.json(
      { 
        status: "degraded", 
        error: "Missing API Keys", 
        missing 
      }, 
      { status: 500 }
    );
  }
  
  return NextResponse.json({ status: "ok" });
}
