"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FiSend, FiCpu, FiUser, FiFolder, FiFile, FiChevronRight, FiChevronDown, FiCode, FiTerminal, FiMessageSquare, FiSearch, FiX } from "react-icons/fi";

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
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono hover:bg-white/5 transition-colors text-left ${
            selectedFile?.path === entry.path ? "bg-[var(--color-sky-blue)]/10 text-[var(--color-sky-blue)]" : "text-[var(--text-secondary)]"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {entry.type === "dir" ? (
            entry.loaded && entry.children && entry.children.length > 0
              ? <FiChevronDown className="w-3 h-3 flex-shrink-0" />
              : <FiChevronRight className="w-3 h-3 flex-shrink-0" />
          ) : null}
          {entry.type === "dir" ? (
            <FiFolder className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-sky-blue)]" />
          ) : (
            <FiFile className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
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
        <div className="w-64 flex-shrink-0 border-r border-[var(--color-outline)]/20 flex flex-col bg-[var(--bg-elevated)]">
          {/* Repo Selector */}
          <div className="p-3 border-b border-[var(--color-outline)]/20">
            <select
              value={selectedRepo?.fullName || ""}
              onChange={(e) => {
                const repo = repos.find(r => r.fullName === e.target.value);
                if (repo) setSelectedRepo(repo);
              }}
              className="w-full bg-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--color-sky-blue)]"
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
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-outline)]/20 bg-[var(--bg-elevated)]">
          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`p-1.5 rounded-lg transition-colors ${showFileExplorer ? "bg-[var(--color-sky-blue)]/10 text-[var(--color-sky-blue)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            title="Toggle file explorer"
          >
            <FiFolder className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCodeViewer(!showCodeViewer)}
            className={`p-1.5 rounded-lg transition-colors ${showCodeViewer ? "bg-[var(--color-sky-blue)]/10 text-[var(--color-sky-blue)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            title="Toggle code viewer"
          >
            <FiCode className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <div className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-orange-400 animate-pulse" : "bg-emerald-400"}`} />
            {selectedRepo ? selectedRepo.fullName : "No repo"} • NVIDIA NIM
          </div>
        </div>

        {/* Split View: Code Viewer + Chat */}
        <div className="flex-1 flex min-h-0">
          {/* Code Viewer */}
          {showCodeViewer && selectedFile && (
            <div className="w-1/2 flex flex-col border-r border-[var(--color-outline)]/20">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-outline)]/10 bg-[var(--bg-base)]">
                <FiFile className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">{selectedFile.path}</span>
                <div className="flex-1" />
                <button onClick={() => { setShowCodeViewer(false); setSelectedFile(null); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-[var(--bg-base)]">
                {loadingFile ? (
                  <div className="p-4 text-xs text-[var(--text-secondary)] animate-pulse">Loading file...</div>
                ) : (
                  <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
                    {selectedFile.content.split("\n").map((line, i) => (
                      <div key={i} className="flex hover:bg-white/[0.02]">
                        <span className="inline-block w-12 text-right pr-4 select-none opacity-30 flex-shrink-0">{i + 1}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <FiMessageSquare className="w-10 h-10" />
                  <div>
                    <p className="text-sm font-medium">Kareixo CodeChat</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {selectedRepo 
                        ? `Ask questions about ${selectedRepo.fullName} — I can read files directly from the repo.`
                        : "Ask any coding question, or connect a repo for file access."}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((m: any) => {
                  const text = getMessageText(m);
                  // Check for tool calls
                  const toolCalls = m.parts?.filter((p: any) => p.type === "tool-invocation") || [];
                  
                  return (
                    <div key={m.id || Math.random().toString()} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role !== "user" && (
                        <div className="w-7 h-7 rounded-full bg-[var(--color-mint)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiCpu className="w-3.5 h-3.5 text-[var(--color-mint)]" />
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] space-y-2 ${m.role === "user" ? "" : ""}`}>
                        {/* Tool call indicators */}
                        {toolCalls.map((tc: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-elevated)] rounded-lg px-3 py-1.5 border border-[var(--color-outline)]/10">
                            <FiSearch className="w-3 h-3" />
                            <span>{tc.toolName === "readFile" ? `Reading ${tc.args?.path}` : tc.toolName === "listDirectory" ? `Listing ${tc.args?.path || "/"}` : `Searching: ${tc.args?.query}`}</span>
                            {tc.state === "result" && <span className="text-emerald-400">✓</span>}
                            {tc.state === "call" && <span className="animate-pulse">…</span>}
                          </div>
                        ))}
                        
                        {/* Text content */}
                        {text && (
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                            m.role === "user"
                              ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                              : "bg-[var(--bg-elevated)] border border-[var(--color-outline)]/15"
                          }`}>
                            <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
                          </div>
                        )}
                      </div>

                      {m.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-[var(--text-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5 text-[var(--bg-base)]">
                          <FiUser className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {error && (
                <div className="bg-[var(--color-coral)]/15 text-[var(--color-coral)] p-3 rounded-xl text-xs border border-[var(--color-coral)]/20">
                  {error.message || "An error occurred."}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-outline)]/20 bg-[var(--bg-elevated)]">
              <form onSubmit={handleSubmit} className="relative">
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
                  className="w-full bg-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[var(--color-sky-blue)] resize-none transition-colors"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 bottom-3 w-8 h-8 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:scale-105"
                >
                  <FiSend className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[10px] text-[var(--text-secondary)] font-mono">
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
