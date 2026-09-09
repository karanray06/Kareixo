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

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load repo file tree when repo is selected
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

  // Toggle directory expansion
  const toggleDir = async (entry: FileEntry, path: string[]) => {
    if (entry.type !== "dir") return;
    if (!entry.loaded && selectedRepo) {
      const children = await loadFileTree(selectedRepo.fullName, entry.path);
      entry.children = children;
      entry.loaded = true;
    }
    setFileTree([...fileTree]); // trigger re-render
  };

  // Load file content
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
      // silent
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

  // Render file tree recursively
  const renderTree = (entries: FileEntry[], depth = 0) => {
    const sorted = [...entries].sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.map((entry) => (
      <div key={entry.path}>
        <button
          onClick={() => entry.type === "dir" ? toggleDir(entry, []) : openFile(entry.path)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono hover:bg-[var(--bg-subtle)] transition-colors text-left ${
            selectedFile?.path === entry.path ? "bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {entry.type === "dir" ? (
            entry.loaded && entry.children && entry.children.length > 0
              ? <ChevronDown size={14} className="flex-shrink-0" />
              : <ChevronRight size={14} className="flex-shrink-0" />
          ) : null}
          {entry.type === "dir" ? (
            <Folder size={14} className="flex-shrink-0 text-[var(--text-muted)]" />
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
    <div className="flex h-full bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Sidebar — File Explorer */}
      {showFileExplorer && (
        <div className="w-64 flex-shrink-0 border-r border-[var(--border-base)] flex flex-col bg-[var(--bg-surface)]">
          {/* Repo Selector */}
          <div className="p-3 border-b border-[var(--border-base)]">
            <select
              value={selectedRepo?.fullName || ""}
              onChange={(e) => {
                const repo = repos.find(r => r.fullName === e.target.value);
                if (repo) setSelectedRepo(repo);
              }}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
            >
              {repos.map(r => (
                <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
              ))}
            </select>
          </div>
          
          {/* File Tree */}
          <div className="flex-1 overflow-y-auto py-1">
            {fileTree.length === 0 ? (
              <div className="p-4 text-xs text-[var(--text-secondary)] text-center">
                {selectedRepo ? "Loading..." : "Select a repository"}
              </div>
            ) : (
              renderTree(fileTree)
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-base)] bg-[var(--bg-surface)]">
          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`p-1.5 rounded-md transition-colors ${showFileExplorer ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"}`}
            title="Toggle file explorer"
          >
            <Folder size={16} />
          </button>
          <button
            onClick={() => setShowCodeViewer(!showCodeViewer)}
            className={`p-1.5 rounded-md transition-colors ${showCodeViewer ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"}`}
            title="Toggle code viewer"
          >
            <Code2 size={16} />
          </button>
          <div className="flex-1" />
          <div className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
            {selectedRepo ? selectedRepo.fullName : "No repo"} • Gemini
          </div>
        </div>

        {/* Split View: Code Viewer + Chat */}
        <div className="flex-1 flex min-h-0">
          {/* Code Viewer */}
          {showCodeViewer && selectedFile && (
            <div className="w-1/2 flex flex-col border-r border-[var(--border-base)]">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-base)] bg-[var(--bg-surface)]">
                <File size={14} className="text-[var(--text-secondary)]" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">{selectedFile.path}</span>
                <div className="flex-1" />
                <button onClick={() => { setShowCodeViewer(false); setSelectedFile(null); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-subtle)]">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-[var(--bg-base)]">
                {loadingFile ? (
                  <div className="p-4 text-xs text-[var(--text-secondary)] animate-pulse">Loading file...</div>
                ) : (
                  <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
                    {selectedFile.content.split("\n").map((line, i) => (
                      <div key={i} className="flex hover:bg-[var(--bg-subtle)]">
                        <span className="inline-block w-10 text-right pr-4 select-none text-[var(--text-muted)] flex-shrink-0">{i + 1}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-base)] flex items-center justify-center text-[var(--text-muted)]">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Kareixo CodeChat</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">
                      {selectedRepo 
                        ? `Ask questions about ${selectedRepo.fullName} — I can read files directly from the repo.`
                        : "Ask any coding question, or connect a repo for file access."}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((m: any) => {
                  const text = getMessageText(m);
                  const toolCalls = m.parts?.filter((p: any) => p.type === "tool-invocation") || [];
                  
                  return (
                    <div key={m.id || Math.random().toString()} className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role !== "user" && (
                        <div className="w-8 h-8 rounded border border-[var(--border-base)] bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Cpu size={16} className="text-[var(--text-primary)]" />
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] space-y-3`}>
                        {/* Tool call indicators */}
                        {toolCalls.map((tc: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-md px-3 py-2 border border-[var(--border-base)]">
                            <Search size={14} />
                            <span>{tc.toolName === "readFile" ? `Reading ${tc.args?.path}` : tc.toolName === "listDirectory" ? `Listing ${tc.args?.path || "/"}` : `Searching: ${tc.args?.query}`}</span>
                            {tc.state === "result" && <span className="text-green-500">✓</span>}
                            {tc.state === "call" && <span className="animate-pulse">...</span>}
                          </div>
                        ))}
                        
                        {/* Text content */}
                        {text && (
                          <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                            m.role === "user"
                              ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                              : "bg-[var(--bg-surface)] border border-[var(--border-base)]"
                          }`}>
                            <div className="whitespace-pre-wrap">{text}</div>
                          </div>
                        )}
                      </div>

                      {m.role === "user" && (
                        <div className="w-8 h-8 rounded border border-[var(--border-base)] bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User size={16} className="text-[var(--text-primary)]" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {error && (
                <div className="bg-red-500/10 text-red-600 p-3 rounded-lg text-sm border border-red-500/20">
                  {error.message || "An error occurred."}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--border-base)] bg-[var(--bg-surface)]">
              <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
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
                  placeholder={selectedRepo ? "Ask about this codebase..." : "Ask any coding question..."}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none transition-colors"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 w-8 h-8 bg-[var(--color-accent)] text-[var(--color-accent-fg)] rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:-translate-y-px"
                >
                  <Send size={14} />
                </button>
              </form>
              <div className="flex justify-center mt-2">
                <span className="text-[10px] text-[var(--text-muted)] font-medium">
                  Shift+Enter for new line
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
