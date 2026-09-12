"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

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
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
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

  const toggleDir = async (entry: FileEntry) => {
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

    const filtered = fileFilter
      ? sorted.filter((e) => e.name.toLowerCase().includes(fileFilter.toLowerCase()) || e.type === "dir")
      : sorted;

    return filtered.map((entry) => (
      <div key={entry.path}>
        <button
          onClick={() => entry.type === "dir" ? toggleDir(entry) : openFile(entry.path)}
          className={`w-full flex items-center gap-1 py-0.5 hover:bg-surface-container rounded cursor-pointer transition-colors text-left ${
            selectedFile?.path === entry.path
              ? "text-fg-default bg-surface-container"
              : "text-fg-subtle hover:text-fg-default"
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {entry.type === "dir" ? (
            <span className="material-symbols-outlined text-[16px] text-accent-amber">
              {entry.loaded && entry.children && entry.children.length > 0 ? "folder_open" : "folder"}
            </span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">javascript</span>
          )}
          <span className="font-code-diff text-code-diff truncate">{entry.name}</span>
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
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] bg-canvas-default text-on-surface">
      {/* LEFT SIDEBAR: Scoped Context & Symbol Tree */}
      <aside className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0 bg-canvas-subtle flex flex-col justify-between">
        <div className="flex flex-col p-space-md gap-space-md">
          {/* Repo & Branch Metadata Card */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-primary text-[18px]">data_object</span>
                <select
                  value={selectedRepo?.fullName || ""}
                  onChange={(e) => {
                    const repo = repos.find((r) => r.fullName === e.target.value);
                    if (repo) setSelectedRepo(repo);
                  }}
                  className="bg-transparent font-code-diff text-code-diff text-fg-default font-semibold truncate border-none outline-none cursor-pointer"
                >
                  {repos.map((r) => (
                    <option key={r.fullName} value={r.fullName}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <span className="px-2 py-0.5 rounded font-badge-mono text-badge-mono bg-diff-addition-line text-diff-addition-text">
                Synced
              </span>
            </div>
            <div className="flex items-center justify-between text-fg-muted font-badge-mono text-badge-mono mb-3">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-accent-purple">
                  alt_route
                </span>
                <input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-transparent text-fg-default font-medium w-16 outline-none"
                />
              </div>
              <div className="flex items-center gap-1 text-fg-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Repository Explorer */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-ui text-label-ui text-fg-muted tracking-wide uppercase">
                Repository Explorer
              </span>
            </div>
            {/* File filter search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-fg-subtle text-[16px]">
                search
              </span>
              <input
                className="w-full bg-canvas-inset rounded-lg pl-8 pr-3 py-1.5 font-body-sm text-body-sm text-fg-default placeholder-fg-subtle focus:outline-none focus:bg-surface-container transition-colors"
                placeholder="Filter files or symbols..."
                type="text"
                value={fileFilter}
                onChange={(e) => setFileFilter(e.target.value)}
              />
            </div>
            {/* Tree List */}
            <div className="flex flex-col gap-0.5 bg-canvas-inset rounded-lg p-2 font-code-diff text-code-diff text-fg-muted max-h-52 overflow-y-auto">
              {fileTree.length === 0 ? (
                <div className="p-4 text-center text-fg-subtle font-body-sm text-body-sm">
                  {selectedRepo ? "Loading..." : "Select a repository"}
                </div>
              ) : (
                renderTree(fileTree)
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Context status */}
        <div className="p-space-md border-t border-border-default">
          <div className="flex items-center justify-between text-fg-muted font-badge-mono text-badge-mono">
            <span>Repository Context</span>
            <span className="text-diff-addition-text flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green-emphasis" />
              SYNCED
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-canvas-default min-h-0">
        {/* Chat header */}
        <header className="h-14 px-space-md border-b border-border-default flex items-center justify-between bg-canvas-subtle/90 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-title-card-sm text-title-card-sm text-fg-default tracking-tight truncate">
              CodeChat Session
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container font-badge-mono text-badge-mono text-fg-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green-emphasis" />
              <span className="text-fg-default font-medium">Gemini</span>
            </span>
          </div>

          {showCodeViewer && selectedFile && (
            <div className="flex items-center gap-2">
              <span className="font-code-diff text-code-diff bg-canvas-inset px-2 py-1 rounded text-fg-muted">
                {selectedFile.path}
              </span>
              <button
                onClick={() => setShowCodeViewer(false)}
                className="p-1 rounded hover:bg-surface-container text-fg-muted hover:text-fg-default transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}
        </header>

        {/* Code viewer or Chat */}
        {showCodeViewer && selectedFile ? (
          <div className="flex-1 overflow-auto bg-canvas-inset flex min-h-0">
            <div className="flex-1 overflow-auto">
              {loadingFile ? (
                <div className="p-4 font-code-diff text-code-diff text-fg-subtle animate-pulse">
                  Loading file...
                </div>
              ) : (
                <pre className="p-4 font-code-diff text-code-diff leading-relaxed whitespace-pre-wrap text-fg-muted">
                  {selectedFile.content.split("\n").map((line, i) => (
                    <div key={i} className="flex hover:bg-surface-container-low transition-colors">
                      <span className="inline-block w-12 text-right pr-3 select-none text-fg-subtle font-code-gutter text-code-gutter flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-space-md py-space-md space-y-6 bg-canvas-default min-h-0 flex flex-col">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-auto">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-fg-muted">
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                </div>
                <div>
                  <p className="font-title-card text-title-card text-fg-default font-semibold">
                    Kareixo CodeChat
                  </p>
                  <p className="font-body-sm text-body-sm text-fg-muted mt-1 max-w-sm">
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
                  <article
                    key={m.id || `msg-${idx}`}
                    className={`flex items-start gap-3.5 max-w-4xl ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    {m.role === "user" ? (
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-badge-mono text-badge-mono font-semibold text-fg-default">
                          U
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                          smart_toy
                        </span>
                      </div>
                    )}

                    <div className={`flex-1 flex flex-col gap-1.5 min-w-0 ${m.role === "user" ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-label-ui text-label-ui font-medium text-fg-default">
                          {m.role === "user" ? "You" : "Kareixo"}
                        </span>
                      </div>

                      {toolCalls.length > 0 && (
                        <div className="flex flex-col gap-1 w-full max-w-[85%]">
                          {toolCalls.map((tc: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 font-code-diff text-code-diff text-fg-muted bg-surface-container rounded-md px-3 py-2"
                            >
                              <span className="material-symbols-outlined text-[14px]">search</span>
                              <span>
                                {tc.toolName === "readFile"
                                  ? `Reading ${tc.args?.path}`
                                  : tc.toolName === "listDirectory"
                                    ? `Listing ${tc.args?.path || "/"}`
                                    : `Searching: ${tc.args?.query}`}
                              </span>
                              {tc.state === "result" && (
                                <span className="text-diff-addition-text ml-auto">✓</span>
                              )}
                              {tc.state === "call" && (
                                <span className="animate-pulse ml-auto">...</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {text && (
                        <div
                          className={`rounded-xl p-4 space-y-3 ${
                            m.role === "user"
                              ? "bg-surface-container border border-border-default shadow-sm"
                              : "bg-transparent p-0 shadow-none"
                          }`}
                        >
                          <div
                            className={`whitespace-pre-wrap font-body-base text-body-base ${
                              m.role === "user" ? "text-fg-default" : "leading-relaxed text-fg-muted"
                            }`}
                          >
                            {text}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
            {error && (
              <div className="bg-diff-deletion-line text-diff-deletion-text p-3 rounded-lg font-body-sm text-body-sm border border-accent-red/20 max-w-4xl">
                {error.message || "An error occurred."}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input area */}
        <div className="p-space-md bg-canvas-subtle/90 backdrop-blur border-t border-border-default mt-auto">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto relative rounded-xl border border-border-default bg-canvas-inset shadow-sm focus-within:border-accent-blue focus-within:shadow-md transition-all"
          >
            <textarea
              ref={inputRef}
              id="prompt-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full min-h-[64px] max-h-48 resize-none bg-transparent py-3 pl-4 pr-14 font-body-base text-body-base text-fg-default placeholder:text-fg-subtle focus:outline-none"
              placeholder={
                selectedRepo ? `Ask about ${selectedRepo.fullName}...` : "Ask any coding question..."
              }
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 bg-primary-container hover:bg-accent-green-hover text-on-primary-container rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </form>
          <div className="flex justify-center mt-2">
            <span className="font-badge-mono text-badge-mono text-fg-subtle">
              Kareixo can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
