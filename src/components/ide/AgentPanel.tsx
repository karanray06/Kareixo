"use client";

import { useState } from "react";
// Note: useChat from '@ai-sdk/react' would be used in a real integration
// For the demo, we orchestrate states manually
import ThinkingStep from "./ThinkingStep";
import ProposedChange from "./ProposedChange";
import SecurityPass from "./SecurityPass";
import ApplyStep from "./ApplyStep";
import ProviderBadge from "../shared/ProviderBadge";
import { checkSecurity, SecurityResult } from "@/lib/security-check";

// Mock file state for the demo
const MOCK_ORIGINAL = `export function rateLimiter(req, res, next) {
  // TODO: implement
  next();
}`;

const MOCK_MODIFIED = `const clients = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  if (!clients.has(ip)) {
    clients.set(ip, []);
  }
  
  const timestamps = clients.get(ip).filter(t => now - t < 15 * 60 * 1000);
  
  if (timestamps.length >= 100) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  timestamps.push(now);
  clients.set(ip, timestamps);
  next();
}`;

export default function AgentPanel() {
  const [explainMode, setExplainMode] = useState(false);
  const [forceModel, setForceModel] = useState<string>("auto");
  
  // For the demo, we'll orchestrate the UI states manually.
  // In a real integration with Vercel AI SDK, this would parse the stream 
  // for specialized tool calls or thought blocks.
  const [demoState, setDemoState] = useState<"idle" | "thinking" | "checking" | "ready" | "applied">("idle");
  const [securityResult, setSecurityResult] = useState<SecurityResult | null>(null);

  const startDemo = async () => {
    setDemoState("thinking");
    
    // Simulate thinking time
    await new Promise(r => setTimeout(r, 2000));
    setDemoState("checking");
    
    // Run security check
    const res = await checkSecurity(MOCK_MODIFIED);
    setSecurityResult(res);
    setDemoState("ready");
  };

  return (
    <div className="flex flex-col h-full bg-graphite-900 border-l border-graphite-700">
      {/* Header */}
      <div className="h-12 border-b border-graphite-700 flex items-center justify-between px-4 shrink-0 bg-graphite-800">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
          </svg>
          <span className="font-display font-bold text-sm text-white">Agent</span>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-graphite-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={explainMode}
              onChange={(e) => setExplainMode(e.target.checked)}
              className="rounded border-graphite-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-graphite-900 bg-graphite-800"
            />
            Explain mode
          </label>
          
          <select 
            value={forceModel}
            onChange={(e) => setForceModel(e.target.value)}
            className="bg-graphite-800 border border-graphite-700 rounded text-xs text-graphite-300 py-1 px-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="auto">Auto (Router)</option>
            <option value="DeepSeek V4 Flash">DeepSeek V4</option>
            <option value="Qwen3 Coder">Qwen3 Coder</option>
            <option value="Llama 3.3 70B">Llama 3.3</option>
          </select>
        </div>
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Mock Initial State */}
        {demoState === "idle" && (
          <div className="text-center mt-10">
            <div className="w-12 h-12 rounded-full bg-graphite-800 border border-graphite-700 mx-auto mb-3 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <h3 className="text-white font-medium mb-1">How can I help?</h3>
            <p className="text-graphite-400 text-sm">
              I can write code, fix bugs, or explain how things work.
            </p>
          </div>
        )}

        {/* User Prompt */}
        {demoState !== "idle" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded bg-graphite-800 border border-graphite-700 shrink-0 flex items-center justify-center text-sm font-bold text-graphite-300 mt-1">
              U
            </div>
            <div className="flex-1 bg-graphite-800 rounded-lg p-3 text-sm text-graphite-100">
              Implement a basic rate limiter in src/middleware/rateLimiter.js
            </div>
          </div>
        )}

        {/* Agent Response Flow */}
        {demoState !== "idle" && (
          <div className="ml-11 space-y-4 relative">
            {/* Connection Line */}
            <div className="absolute left-[-23px] top-4 bottom-4 w-px bg-graphite-700 -z-10" />

            <ThinkingStep 
              content={demoState === "thinking" ? "" : "I'll implement a sliding window rate limiter using a Map to store IPs and timestamps. This avoids external dependencies while providing robust protection against abuse."}
              isStreaming={demoState === "thinking"}
            />

            {(demoState === "checking" || demoState === "ready" || demoState === "applied") && (
              <>
                <ProposedChange 
                  original={MOCK_ORIGINAL}
                  modified={MOCK_MODIFIED}
                  filename="src/middleware/rateLimiter.js"
                />

                <SecurityPass 
                  result={securityResult}
                  isChecking={demoState === "checking"}
                />

                {demoState !== "checking" && demoState !== "applied" && (
                  <ApplyStep 
                    onApply={() => setDemoState("applied")}
                    onReject={() => setDemoState("idle")}
                    isApplying={false}
                    canApply={securityResult?.passed ?? false}
                    providerBadge={<ProviderBadge model={forceModel === "auto" ? "DeepSeek V4 Flash" : forceModel} provider="OpenRouter" latency="1.4s" />}
                  />
                )}

                {demoState === "applied" && (
                  <div className="text-xs text-graphite-500 font-mono mt-4 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Changes applied to workspace.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-graphite-700 bg-graphite-900 shrink-0">
        <div className="relative">
          <textarea
            placeholder="Ask anything or generate code..."
            className="w-full bg-graphite-800 border border-graphite-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 resize-none h-24"
            disabled={demoState === "thinking" || demoState === "checking"}
          />
          <button 
            onClick={startDemo}
            disabled={demoState === "thinking" || demoState === "checking"}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[10px] text-graphite-500 font-mono">
            Pro tip: Use @ to reference files
          </span>
          <span className="text-[10px] text-graphite-500 font-mono flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Router online
          </span>
        </div>
      </div>
    </div>
  );
}
