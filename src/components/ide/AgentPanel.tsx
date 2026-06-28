"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import ThinkingStep from "./ThinkingStep";
import ProposedChange from "./ProposedChange";
import SecurityPass from "./SecurityPass";
import ApplyStep from "./ApplyStep";
import ProviderBadge from "../shared/ProviderBadge";
import { checkSecurity, SecurityResult } from "@/lib/security-check";

interface AgentPanelProps {
  currentFile?: string;
  currentContent?: string;
  onApplyChange?: (newContent: string) => void;
}

// Produce a minimal unified diff between two strings
function produceDiff(original: string, modified: string): string {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  const removed = origLines.map((l) => `- ${l}`).join("\n");
  const added = modLines.map((l) => `+ ${l}`).join("\n");
  return `${removed}\n${added}`;
}

// Extract a code block from LLM response (first fenced block or raw text)
function extractCode(text: string): string | null {
  const fenced = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
  if (fenced) return fenced[1].trimEnd();
  // If the whole response looks like code (no prose), return it
  if (text.trim().startsWith("//") || text.trim().startsWith("import") || text.trim().startsWith("export") || text.trim().startsWith("const") || text.trim().startsWith("function")) {
    return text.trim();
  }
  return null;
}

type AgentPhase = "idle" | "thinking" | "diffing" | "checking" | "ready" | "applied";

export default function AgentPanel({
  currentFile = "src/index.js",
  currentContent = "",
  onApplyChange,
}: AgentPanelProps) {
  const [explainMode, setExplainMode] = useState(false);
  const [forceModel, setForceModel] = useState<string>("auto");
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [proposedCode, setProposedCode] = useState<string | null>(null);
  const [securityResult, setSecurityResult] = useState<SecurityResult | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ provider: string; model: string } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [latency, setLatency] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, setInput, append, status, data } = useChat({
    api: "/api/chat",
    body: {
      taskType: "code",
      forceProvider: forceModel === "auto" ? undefined : forceModel,
    },
    onResponse(response: any) {
      // Read provider headers from the streaming response
      const provider = response.headers.get("X-Kareixo-Provider");
      const model = response.headers.get("X-Kareixo-Model");
      if (provider && model) {
        setProviderInfo({ provider, model });
      }
      if (startTime) {
        setLatency(((Date.now() - startTime) / 1000).toFixed(1) + "s");
      }
    },
    async onFinish(message: any) {
      // Extract code from the model's response
      const code = extractCode(message.content);
      if (code) {
        setProposedCode(code);
        setPhase("checking");
        const diff = produceDiff(currentContent, code);
        const result = await checkSecurity(diff);
        setSecurityResult(result);
        setPhase("ready");
      } else {
        // Pure text response (explanation) — show as idle so user can continue chat
        setPhase("idle");
      }
    },
    onError: (err) => {
      setPhase("idle");
      // Append a system error message to the chat
      append({
        role: "assistant",
        content: `**Error:** ${err.message || "Failed to reach AI providers. Please check your API keys."}`,
      });
    },
  } as any) as any;

  // Derive the last assistant text message for ThinkingStep
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  const handleSubmit = async () => {
    const trimmed = input?.trim() || "";
    if (!trimmed || status === "streaming" || status === "submitted") return;

    setStartTime(Date.now());
    setPhase("thinking");
    setProposedCode(null);
    setSecurityResult(null);
    setProviderInfo(null);
    setLatency(null);
    setInput("");

    // Build system context: include current file content
    await append({
      role: "user",
      content: explainMode
        ? `Explain clearly (no code changes needed): ${trimmed}\n\nCurrent file (${currentFile}):\n\`\`\`\n${currentContent}\n\`\`\``
        : `You are a coding assistant. The user is editing \`${currentFile}\`. Return ONLY the complete updated file content inside a single fenced code block. Do not include any prose outside the code block unless asked to explain.\n\nUser request: ${trimmed}\n\nCurrent file content:\n\`\`\`\n${currentContent}\n\`\`\``,
    });
  };

  const handleApply = () => {
    if (proposedCode && onApplyChange) {
      onApplyChange(proposedCode);
    }
    setPhase("applied");
  };

  const handleReject = () => {
    setPhase("idle");
    setProposedCode(null);
    setSecurityResult(null);
  };

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-full bg-graphite-900 border-l border-graphite-700">
      {/* Header */}
      <div className="h-9 border-b border-graphite-700 flex items-center justify-between px-4 shrink-0 bg-graphite-800">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
          </svg>
          <span className="font-display font-bold text-sm text-white">Agent</span>
          {providerInfo && (
            <span className="text-[10px] text-graphite-500 font-mono">— {providerInfo.provider}</span>
          )}
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
            <option value="Llama 3 70B">Llama 3.3</option>
          </select>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {phase === "idle" && messages.length === 0 && (
          <div className="text-center mt-10">
            <div className="w-12 h-12 rounded-full bg-graphite-800 border border-graphite-700 mx-auto mb-3 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              </svg>
            </div>
            <h3 className="text-white font-medium mb-1">How can I help?</h3>
            <p className="text-graphite-400 text-sm">
              {explainMode
                ? "Ask me to explain any code in the current file."
                : "Describe a change and I'll write the code, show you the diff, and run a security check before anything lands."}
            </p>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg: any, i: number) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded bg-graphite-800 border border-graphite-700 shrink-0 flex items-center justify-center text-sm font-bold text-graphite-300 mt-1">
                  U
                </div>
                <div className="flex-1 bg-graphite-800 rounded-lg p-3 text-sm text-graphite-100 whitespace-pre-wrap">
                  {/* Strip the injected context from display */}
                  {msg.content.split("\n\nCurrent file")[0].replace(/^You are a coding assistant[\s\S]*?User request: /, "")}
                </div>
              </div>
            );
          }

          // For assistant messages: render them if they are the FINAL text response in "idle" phase,
          // or if they are explicitly marked as Error
          const isError = msg.content.startsWith("**Error:**");
          const isLastMessage = i === messages.length - 1;
          const hasCode = !!extractCode(msg.content);
          
          if ((phase === "idle" || isError) && !hasCode && msg.role === "assistant" && isLastMessage) {
            return (
              <div key={msg.id} className="ml-11 space-y-4">
                <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${isError ? "bg-red-950/50 text-red-400 border border-red-900/50" : "bg-graphite-800 text-graphite-300"}`}>
                  {msg.content}
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Agent Response Flow */}
        {(phase === "thinking" || isStreaming) && (
          <div className="ml-11 space-y-4 relative">
            <div className="absolute left-[-23px] top-4 bottom-4 w-px bg-graphite-700 -z-10" />
            <ThinkingStep
              content={lastAssistantMessage?.content || ""}
              isStreaming={true}
            />
          </div>
        )}

        {phase === "diffing" && (
          <div className="ml-11">
            <div className="text-xs text-graphite-400 font-mono animate-pulse">Computing diff...</div>
          </div>
        )}

        {(phase === "checking" || phase === "ready" || phase === "applied") && proposedCode && (
          <div className="ml-11 space-y-4 relative">
            <div className="absolute left-[-23px] top-4 bottom-4 w-px bg-graphite-700 -z-10" />

            <ThinkingStep
              content={lastAssistantMessage?.content?.replace(/```[\s\S]*?```/g, "[code block]")?.trim() || "Code generated."}
              isStreaming={false}
            />

            <ProposedChange
              original={currentContent}
              modified={proposedCode}
              filename={currentFile}
            />

            <SecurityPass
              result={securityResult}
              isChecking={phase === "checking"}
            />

            {phase === "ready" && (
              <ApplyStep
                onApply={handleApply}
                onReject={handleReject}
                isApplying={false}
                canApply={securityResult?.passed ?? false}
                providerBadge={
                  providerInfo ? (
                    <ProviderBadge
                      model={providerInfo.model}
                      provider={providerInfo.provider}
                      latency={latency || "—"}
                    />
                  ) : null
                }
              />
            )}

            {phase === "applied" && (
              <div className="text-xs text-graphite-500 font-mono mt-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Changes applied to {currentFile}.
              </div>
            )}
          </div>
        )}

        {isStreaming && phase === "thinking" && !lastAssistantMessage && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded bg-cyan-900/30 border border-cyan-800/50 shrink-0 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              </svg>
            </div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-graphite-800 rounded w-3/4"></div>
              <div className="h-3 bg-graphite-800 rounded w-1/2"></div>
              <div className="h-3 bg-graphite-800 rounded w-5/6"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-graphite-700 bg-graphite-900 shrink-0">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={explainMode ? "Ask me to explain..." : "Describe what to code or fix..."}
            className="w-full bg-graphite-800 border border-graphite-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 resize-none h-24"
            disabled={isStreaming || phase === "checking"}
          />
          <button
            onClick={handleSubmit}
            disabled={isStreaming || phase === "checking" || !input?.trim()}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[10px] text-graphite-500 font-mono">
            Shift+Enter for new line · Enter to send
          </span>
          <span className="text-[10px] text-graphite-500 font-mono flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
            {isStreaming ? "Thinking..." : "Router online"}
          </span>
        </div>
      </div>
    </div>
  );
}
