"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  Send, Cpu, User, Folder, File, ChevronRight, ChevronDown, 
  Code2, TerminalSquare, MessageSquare, Search, X 
} from "lucide-react";

type FileEntry = {
  name: string;
  type: "file" | "dir";
  path: string;
  size?: number;
  children?: FileEntry[];
  loaded?: boolean;
};

type RepoInfo = {
  fullName: string;
  installationId: number;
};

export default function CodeChatClient({ repos }: { repos: RepoInfo[] }) {
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(repos[0] || null);
  const [branch, setBranch] = useState<string>("main");
  const [fileTree, setFileTree] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/codechat",
    body: {
      repoFullName: selectedRepo?.fullName,
      branch,
    },
  }), [selectedRepo?.fullName, branch]);

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadFileTree = useCallback(async (repoFullName: string, dirPath = "") => {
    try {
      const res = await fetch("/api/codechat/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName, path: dirPath, branch }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.entries || []).map((e: any) => ({
        ...e,
        children: e.type === "dir" ? [] : undefined,
        loaded: false,
      }));
    } catch {
      return [];
    }
  }, [branch]);

  useEffect(() => {
    if (selectedRepo) {
      loadFileTree(selectedRepo.fullName).then(setFileTree);
    }
  }, [selectedRepo, loadFileTree]);

  const toggleDir = async (entry: FileEntry, path: string[]) => {
    if (entry.type !== "dir") return;
    if (!entry.loaded && selectedRepo) {
      const children = await loadFileTree(selectedRepo.fullName, entry.path);
      entry.children = children;
      entry.loaded = true;
    }
    setFileTree([...fileTree]); 
  };

  const openFile = async (filePath: string) => {
    if (!selectedRepo) return;
    setLoadingFile(true);
    setShowCodeViewer(true);
    try {
      const res = await fetch("/api/codechat/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: selectedRepo.fullName, path: filePath, branch, readFile: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFile({ path: filePath, content: data.content || "" });
      }
    } catch {
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    try {
      await sendMessage({ role: "user", parts: [{ type: "text", text: currentInput }] });
    } catch (err) {
      console.error(err);
    }
  };

  const renderTree = (entries: FileEntry[], depth = 0) => {
    const sorted = [...entries].sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.map((entry) => (
      <div key={entry.path}>
        <button
          onClick={() => entry.type === "dir" ? toggleDir(entry, []) : openFile(entry.path)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono hover:bg-surface-subtle transition-colors text-left ${
            selectedFile?.path === entry.path ? "bg-surface-subtle font-medium text-text-primary" : "text-text-secondary"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {entry.type === "dir" ? (
            entry.loaded && entry.children && entry.children.length > 0
              ? <ChevronDown size={14} className="flex-shrink-0" />
              : <ChevronRight size={14} className="flex-shrink-0" />
          ) : null}
          {entry.type === "dir" ? (
            <Folder size={14} className="flex-shrink-0 text-text-muted" />
          ) : (
            <File size={14} className="flex-shrink-0 opacity-50" />
          )}
          <span className="truncate">{entry.name}</span>
        </button>
        {entry.type === "dir" && entry.loaded && entry.children && (
          <div>{renderTree(entry.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const getMessageText = (msg: any): string => {
    if (msg.parts) {
      return msg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("");
    }
    return msg.content || "";
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-0 bg-surface rounded-xl shadow-sm overflow-hidden border border-border h-full">
      {/* Sidebar */}
      <aside className="col-span-12 lg:col-span-3 bg-surface-subtle/70 flex flex-col justify-between border-r border-border h-full">
        <div className="p-4 flex flex-col gap-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-ai-hover animate-pulse"></span>
              <span className="font-title-card-sm text-title-card-sm text-text-primary tracking-tight">Kareixo Chat</span>
            </div>
            <span className="font-badge-mono text-[11px] px-2 py-0.5 rounded-md bg-accent-ai-subtle text-accent-ai-hover font-medium">v2.4 Live</span>
          </div>

          <button onClick={() => window.location.reload()} className="w-full h-9 px-3 rounded-lg bg-text-primary hover:bg-black text-on-primary flex items-center justify-between transition-all duration-150 shadow-sm group" type="button">
            <span className="flex items-center gap-2 font-label-ui text-label-ui">
              <span className="material-symbols-outlined text-[18px] text-white">add</span>
              New Thread
            </span>
            <kbd className="font-badge-mono text-[11px] px-1.5 py-0.5 rounded bg-white/20 text-white/90">⌘N</kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-2 py-1 mt-2 text-[11px] font-badge-mono text-text-muted uppercase tracking-wider">File Explorer</div>
          
          <div className="mb-2">
            <select
              value={selectedRepo?.fullName || ""}
              onChange={(e) => {
                const repo = repos.find(r => r.fullName === e.target.value);
                if (repo) setSelectedRepo(repo);
              }}
              className="w-full bg-surface border border-border-interactive rounded-lg px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-text-primary"
            >
              {repos.map(r => (
                <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
              ))}
            </select>
          </div>

          {fileTree.length === 0 ? (
            <div className="p-4 text-xs text-text-secondary text-center">
              {selectedRepo ? "Loading..." : "Select a repository"}
            </div>
          ) : (
            renderTree(fileTree)
          )}
        </div>

        <div className="p-3 border-t border-border bg-surface flex flex-col gap-2">
          <div className="text-[11px] font-badge-mono text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Repository Context</span>
            <span className="text-success flex items-center gap-1 font-medium text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> SYNCED
            </span>
          </div>
          <div className="p-2 rounded-lg bg-surface-subtle border border-border flex items-center justify-between cursor-pointer hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-text-secondary text-[18px]">folder_code</span>
              <div className="min-w-0">
                <p className="font-badge-mono text-[12px] text-text-primary font-medium truncate">{selectedRepo ? selectedRepo.fullName : "No repo"}</p>
                <div className="flex items-center gap-2 text-[11px] font-badge-mono text-text-muted">
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">fork_right</span> {branch}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="col-span-12 lg:col-span-9 flex flex-col bg-surface h-full min-h-0">
        <header className="h-14 px-5 border-b border-border flex items-center justify-between bg-surface/90 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-title-card-sm text-title-card-sm text-text-primary tracking-tight truncate">
                Current Session
              </h1>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-subtle border border-border text-[11px] font-badge-mono text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              <span className="text-text-primary font-medium">Gemini 1.5 Pro</span>
            </div>
          </div>
          
          {showCodeViewer && selectedFile && (
             <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-surface-subtle px-2 py-1 rounded border border-border text-text-secondary">
                  {selectedFile.path}
                </span>
                <button onClick={() => setShowCodeViewer(false)} className="h-8 w-8 rounded-md border border-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors">
                  <X size={14} />
                </button>
             </div>
          )}
        </header>

        {showCodeViewer && selectedFile ? (
          <div className="flex-1 overflow-auto bg-surface-bright flex min-h-0">
            <div className="flex-1 overflow-auto">
              {loadingFile ? (
                <div className="p-4 text-xs text-text-secondary animate-pulse">Loading file...</div>
              ) : (
                <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-text-secondary">
                  {selectedFile.content.split("\n").map((line, i) => (
                    <div key={i} className="flex hover:bg-surface-subtle">
                      <span className="inline-block w-10 text-right pr-4 select-none text-text-muted flex-shrink-0">{i + 1}</span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-surface-bright min-h-0 flex flex-col">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-auto">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-base font-semibold">Kareixo CodeChat</p>
                  <p className="text-sm text-text-secondary mt-1 max-w-sm">
                    {selectedRepo 
                      ? `Ask questions about ${selectedRepo.fullName} — I can read files directly from the repo.`
                      : "Ask any coding question, or connect a repo for file access."}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m: any, idx: number) => {
                const text = getMessageText(m);
                const toolCalls = m.parts?.filter((p: any) => p.type === "tool-invocation") || [];
                
                return (
                  <article key={m.id || `msg-${idx}`} className={`flex items-start gap-3.5 max-w-4xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    {m.role === "user" ? (
                      <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                        <span className="font-badge-mono text-xs font-semibold text-text-primary">U</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
                      </div>
                    )}
                    
                    <div className={`flex-1 flex flex-col gap-1.5 min-w-0 ${m.role === 'user' ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-label-ui text-label-ui font-medium text-text-primary">{m.role === 'user' ? 'User' : 'Kareixo'}</span>
                      </div>

                      {toolCalls.length > 0 && (
                        <div className="flex flex-col gap-1 w-full max-w-[85%]">
                          {toolCalls.map((tc: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-mono text-text-secondary bg-surface rounded-md px-3 py-2 border border-border">
                              <Search size={14} />
                              <span>{tc.toolName === "readFile" ? `Reading ${tc.args?.path}` : tc.toolName === "listDirectory" ? `Listing ${tc.args?.path || "/"}` : `Searching: ${tc.args?.query}`}</span>
                              {tc.state === "result" && <span className="text-success ml-auto">✓</span>}
                              {tc.state === "call" && <span className="animate-pulse ml-auto">...</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {text && (
                        <div className={`rounded-xl p-4 border border-border shadow-2xs space-y-3 ${m.role === 'user' ? 'bg-surface' : 'bg-transparent border-none p-0 shadow-none'}`}>
                          <div className={`whitespace-pre-wrap font-body-base text-body-base ${m.role === 'user' ? 'text-text-primary' : 'leading-relaxed text-text-secondary'}`}>{text}</div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
            {error && (
              <div className="bg-error-subtle text-error p-3 rounded-lg text-sm border border-error/20 max-w-4xl">
                {error.message || "An error occurred."}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="p-4 bg-surface/90 backdrop-blur border-t border-border mt-auto">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative rounded-xl border border-border-interactive bg-surface-subtle shadow-sm focus-within:border-text-primary focus-within:shadow-md transition-all">
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
              className="w-full min-h-[64px] max-h-48 resize-none bg-transparent py-3 pl-4 pr-14 text-body-base text-text-primary placeholder:text-text-muted focus:outline-none" 
              placeholder={selectedRepo ? `Ask about ${selectedRepo.fullName}...` : "Ask any coding question..."}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 bg-text-primary hover:bg-black text-on-primary rounded-lg flex items-center justify-center transition-all disabled:opacity-30" 
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </form>
          <div className="flex justify-center mt-2">
            <span className="font-badge-mono text-[10px] text-text-muted">Kareixo can make mistakes. Check important info.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
