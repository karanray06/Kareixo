"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import ThinkingStep from "./ThinkingStep";
import ProposedChange from "./ProposedChange";
import SecurityPass from "./SecurityPass";
import ApplyStep from "./ApplyStep";
import ProviderBadge from "../shared/ProviderBadge";
import { checkSecurity, SecurityResult } from "@/lib/security-check";
import { AgentTask } from "@/lib/agent-planner";
import { TaskChecklist } from "./TaskChecklist";

interface AgentPanelProps {
  projectId: string;
  localFiles: Record<string, string>;
  currentFile?: string;
  currentContent?: string;
  onApplyChange?: (newContent: string) => void;
  onUpdateFile?: (path: string, content: string) => void;
}

// Produce a minimal unified diff between two strings
function produceDiff(original: string, modified: string): string {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  const removed = origLines.map((l) => `- ${l}`).join("\n");
  const added = modLines.map((l) => `+ ${l}`).join("\n");
  return `${removed}\n${added}`;
}

// Extract text content from a UIMessage (ai@7 uses parts array, not content string)
function getMessageText(msg: any): string {
  // ai@7 UIMessage format: { parts: [{ type: 'text', text: '...' }, ...] }
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text || "")
      .join("");
  }
  // Fallback for legacy format
  if (typeof msg.content === "string") return msg.content;
  return "";
}

// Extract a code block from LLM response (first fenced block or raw text)
function extractCode(text: string): string | null {
  if (!text) return null;
  const fenced = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
  if (fenced) return fenced[1].trimEnd();
  // If the whole response looks like code (no prose), return it
  if (text.trim().startsWith("//") || text.trim().startsWith("import") || text.trim().startsWith("export") || text.trim().startsWith("const") || text.trim().startsWith("function")) {
    return text.trim();
  }
  return null;
}

type AgentPhase = "idle" | "thinking" | "diffing" | "checking" | "ready" | "applied" | "planning" | "executing";

export default function AgentPanel({
  projectId,
  localFiles,
  currentFile = "src/index.js",
  currentContent = "",
  onApplyChange,
  onUpdateFile,
}: AgentPanelProps) {
  const [explainMode, setExplainMode] = useState(false);
  const [plannerMode, setPlannerMode] = useState(true);
  const [forceModel, setForceModel] = useState<string>("auto");
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [proposedCode, setProposedCode] = useState<string | null>(null);
  const [securityResult, setSecurityResult] = useState<SecurityResult | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ provider: string; model: string } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [latency, setLatency] = useState<string | null>(null);
  const [localInput, setLocalInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Planner State
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ai@7 useChat: returns sendMessage, messages, status, error
  const { messages, sendMessage, status, error, setMessages } = useChat({
    api: "/api/chat",
    body: {
      taskType: "code",
      forceProvider: forceModel === "auto" ? undefined : forceModel,
    },
    onFinish({ message }: any) {
      if (plannerMode) return; // Handled separately
      // Extract code from the model's response
      const text = getMessageText(message);
      const code = extractCode(text);
      if (code) {
        setProposedCode(code);
        setPhase("checking");
        const diff = produceDiff(currentContent, code);
        checkSecurity(diff).then((result) => {
          setSecurityResult(result);
          setPhase("ready");
        });
      } else {
        // Pure text response (explanation)
        setPhase("idle");
      }
      if (startTime) {
        setLatency(((Date.now() - startTime) / 1000).toFixed(1) + "s");
      }
    },
    onError(err: Error) {
      if (plannerMode) return;
      setPhase("idle");
      const message = err.message === "An error occurred." 
        ? "Failed to generate response. Please check if your API keys are valid."
        : (err.message || "Failed to reach AI providers.");
      setErrorMsg(message);
    },
  } as any);

  // Derive the last assistant text message for ThinkingStep
  const lastAssistantMessage = [...messages].reverse().find((m: any) => m.role === "assistant");
  const lastAssistantText = lastAssistantMessage ? getMessageText(lastAssistantMessage) : "";

  // ─── PLANNER EXECUTION LOOP ─────────────────────────────────────────────
  
  const executeTask = async (task: AgentTask, allTasks: AgentTask[]) => {
    // 50s timeout to prevent hanging on a single task
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    try {
      const res = await fetch("/api/agent/execute-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          projectId,
          projectContext: Object.keys(localFiles).join("\n"),
          existingCode: localFiles[task.filename] || "",
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const textResponse = await res.text();
        let errMessage = "Execution failed";
        try {
          const errData = JSON.parse(textResponse);
          errMessage = errData.error || errMessage;
        } catch (parseError) {
          errMessage = textResponse || errMessage;
        }
        throw new Error(errMessage);
      }

      const data = await res.json();
      
      // Update file locally and trigger auto-save
      if (onUpdateFile) {
        onUpdateFile(task.filename, data.code);
      }
      
      return data; // { code, securityResult, provider, model }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === "AbortError") {
        throw new Error("Task timed out (exceeded 50s limit).");
      }
      throw e;
    }
  };

  const runPlannerLoop = async (prompt: string) => {
    try {
      setPhase("planning");
      const planRes = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          projectId,
          projectContext: Object.keys(localFiles).join("\n"),
        })
      });

      if (!planRes.ok) {
        const textResponse = await planRes.text();
        let errMessage = "Planning failed";
        try {
          const errData = JSON.parse(textResponse);
          errMessage = errData.error || errMessage;
        } catch (parseError) {
          errMessage = textResponse || errMessage;
        }
        throw new Error(errMessage);
      }

      const planData = await planRes.json();
      const newTasks: AgentTask[] = planData.tasks;
      setTasks(newTasks);
      setPhase("executing");

      let currentTasks = [...newTasks];

      for (let i = 0; i < currentTasks.length; i++) {
        let task = currentTasks[i];
        
        // Mark as running
        task.status = "running";
        setTasks([...currentTasks]);

        try {
          await executeTask(task, currentTasks);
          task.status = "done";
          task.error = undefined;
        } catch (e: any) {
          task.status = "failed";
          task.error = e.message;
        }
        
        setTasks([...currentTasks]);
      }
      
      setPhase("idle");
    } catch (e: any) {
      console.error("Planner error:", e);
      setErrorMsg("Planner error: " + (e.message || String(e)));
      setPhase("idle");
    }
  };

  const handleRetryTask = async (taskId: string) => {
    if (phase === "executing") return; // Cannot retry while already executing

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    newTasks[taskIndex].status = "running";
    newTasks[taskIndex].error = undefined;
    setTasks(newTasks);
    setPhase("executing");

    try {
      await executeTask(newTasks[taskIndex], newTasks);
      newTasks[taskIndex].status = "done";
    } catch (e: any) {
      newTasks[taskIndex].status = "failed";
      newTasks[taskIndex].error = e.message;
    }

    setTasks([...newTasks]);
    
    // If all tasks are done or failed, go back to idle
    const stillRunning = newTasks.some(t => t.status === "running" || t.status === "pending");
    if (!stillRunning) {
      setPhase("idle");
    }
  };

  // ─── DERIVED STATE ───────────────────────────────────────────────────

  const isStreaming = status === "streaming" || status === "submitted" || phase === "planning" || phase === "executing";

  // ─── SUBMIT HANDLER ───────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const trimmed = localInput.trim();
      if (!trimmed || isStreaming) return;

      setStartTime(Date.now());
      setProposedCode(null);
      setSecurityResult(null);
      setProviderInfo(null);
      setLatency(null);
      setErrorMsg(null);
      setLocalInput("");

      if (explainMode) {
        // Explain mode is always single-shot
        setPhase("thinking");
        const prompt = `Explain clearly (no code changes needed): ${trimmed}\n\nCurrent file (${currentFile}):\n\`\`\`\n${currentContent}\n\`\`\``;
        await sendMessage({ text: prompt });
      } else if (plannerMode) {
        // Run full multi-step agent
        await runPlannerLoop(trimmed);
      } else {
        // Single shot edit mode
        setPhase("thinking");
        const prompt = `You are a coding assistant. The user is editing \`${currentFile}\`. Return ONLY the complete updated file content inside a single fenced code block. Do not include any prose outside the code block unless asked to explain.\n\nUser request: ${trimmed}\n\nCurrent file content:\n\`\`\`\n${currentContent}\n\`\`\``;
        await sendMessage({ text: prompt });
      }
    } catch (e: any) {
      console.error("AgentPanel handleSubmit error:", e);
      setErrorMsg("Submit error: " + (e.message || String(e)));
      setPhase("idle");
    }
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


  return (
    <div className="flex flex-col h-full bg-cream-100 border-l border-cream-300">
      {/* Header */}
      <div className="h-10 border-b border-cream-300 flex items-center justify-between px-3 shrink-0 bg-cream-200">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral-400">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
          </svg>
          <span className="font-display font-bold text-sm text-dusk-900">Agent</span>
          {providerInfo && (
            <span className="text-[10px] text-dusk-500 font-mono">— {providerInfo.provider}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-dusk-700 cursor-pointer">
            <input
              type="checkbox"
              checked={plannerMode && !explainMode}
              onChange={(e) => {
                if (e.target.checked) {
                  setPlannerMode(true);
                  setExplainMode(false);
                } else {
                  setPlannerMode(false);
                }
              }}
              className="rounded border-dusk-400 text-coral-400 focus:ring-coral-400 focus:ring-offset-cream-100 bg-cream-200"
            />
            Multi-step
          </label>
          <label className="flex items-center gap-1.5 text-xs text-dusk-700 cursor-pointer">
            <input
              type="checkbox"
              checked={explainMode}
              onChange={(e) => {
                if (e.target.checked) {
                  setExplainMode(true);
                  setPlannerMode(false);
                } else {
                  setExplainMode(false);
                }
              }}
              className="rounded border-dusk-400 text-coral-400 focus:ring-coral-400 focus:ring-offset-cream-100 bg-cream-200"
            />
            Explain
          </label>
        </div>
      </div>

      {/* Message History & Planner view */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Planner Task List */}
        {tasks.length > 0 && !explainMode && (
          <TaskChecklist tasks={tasks} onRetryTask={handleRetryTask} />
        )}

        {phase === "idle" && messages.length === 0 && tasks.length === 0 && !errorMsg && (
          <div className="text-center mt-10">
            <div className="w-12 h-12 rounded-full bg-cream-200 border border-cream-300 mx-auto mb-3 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coral-400">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              </svg>
            </div>
            <h3 className="text-dusk-900 font-medium mb-1">How can I help?</h3>
            <p className="text-dusk-500 text-sm">
              {explainMode
                ? "Ask me to explain any code in the current file."
                : plannerMode 
                  ? "Describe a complex change, and I will plan and execute it across multiple files."
                  : "Describe a change for the current file and I'll generate the diff."}
            </p>
          </div>
        )}

        {/* Planner status steps */}
        {phase === "planning" && (
          <div className="ml-11">
            <div className="text-xs text-coral-400 font-mono animate-pulse flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-coral-400 border-t-transparent rounded-full animate-spin"></div>
               Planning tasks...
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="ml-11 space-y-4">
            <div className="p-3 rounded-lg text-sm whitespace-pre-wrap bg-red-950/50 text-red-400 border border-red-900/50">
              <strong>Error:</strong> {errorMsg}
            </div>
          </div>
        )}

        {/* Single-shot Agent Response Flow */}
        {!plannerMode && (phase === "thinking" || isStreaming) && (
          <div className="ml-11 space-y-4 relative">
            <div className="absolute left-[-23px] top-4 bottom-4 w-px bg-cream-300 -z-10" />
            <ThinkingStep
              content={lastAssistantText || ""}
              isStreaming={true}
            />
          </div>
        )}

        {!plannerMode && phase === "diffing" && (
          <div className="ml-11">
            <div className="text-xs text-dusk-500 font-mono animate-pulse">Computing diff...</div>
          </div>
        )}

        {!plannerMode && (phase === "checking" || phase === "ready" || phase === "applied") && proposedCode && (
          <div className="ml-11 space-y-4 relative">
            <div className="absolute left-[-23px] top-4 bottom-4 w-px bg-cream-300 -z-10" />

            <ThinkingStep
              content={lastAssistantText?.replace(new RegExp("```[\\\\s\\\\S]*?```", "g"), "[code block]")?.trim() || "Code generated."}
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
              <div className="text-xs text-dusk-500 font-mono mt-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Changes applied to {currentFile}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-cream-300 bg-cream-100 shrink-0">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              explainMode ? "Ask me to explain..." 
              : plannerMode ? "Describe what to build or fix..." 
              : "Describe a change to the current file..."
            }
            className="w-full bg-cream-200 border border-cream-300 rounded-lg pl-4 pr-12 py-3 text-sm text-dusk-900 focus:outline-none focus:border-coral-400 resize-none h-24"
            disabled={isStreaming || phase === "checking"}
          />
          <button
            onClick={handleSubmit}
            disabled={isStreaming || phase === "checking" || !localInput.trim()}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-md bg-coral-500 hover:bg-coral-400 text-cream-50 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[10px] text-dusk-500 font-mono">
            Shift+Enter for new line · Enter to send
          </span>
          <span className="text-[10px] text-dusk-500 font-mono flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-rosegold-400 animate-pulse" : "bg-green-400"}`} />
            {isStreaming ? "Working..." : "Router online"}
          </span>
        </div>
      </div>
    </div>
  );
}
