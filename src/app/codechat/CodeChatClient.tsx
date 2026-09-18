"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiffViewer from "@/components/shared/DiffViewer";
import { FolderOpen, Folder, FileCode2, Database, GitBranch, Search, X, MessageSquare, Bot, GitMerge, ArrowUp, User, ShieldCheck, Plus, MessageCircle, Terminal } from "lucide-react";

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

function CodeChatClientContent({ repos }: { repos: RepoInfo[] }) {
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(repos[0] || null);
  const [branch, setBranch] = useState<string>("main");
  const [fileTree, setFileTree] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [appliedProposals, setAppliedProposals] = useState<
    Record<string, { prUrl: string; prNumber: number; branchName: string }>
  >({});
  const [discardedProposals, setDiscardedProposals] = useState<Set<string>>(new Set());

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const initialConversationId = searchParams.get("conversation");
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [conversations, setConversations] = useState<any[]>([]);

  const fetchConversations = useCallback(async (repoFullName: string) => {
    try {
      const res = await fetch(`/api/codechat/conversations?repoFullName=${encodeURIComponent(repoFullName)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (selectedRepo) fetchConversations(selectedRepo.fullName);
    else setConversations([]);
  }, [selectedRepo, fetchConversations]);

  useEffect(() => {
    if (initialConversationId && initialConversationId !== conversationId) {
      fetch(`/api/codechat/conversations/${initialConversationId}`)
        .then(r => r.json())
        .then(d => {
          if (d.messages) setMessages(d.messages);
          setConversationId(initialConversationId);
        });
    }
  }, [initialConversationId]);

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/codechat",
    body: {
      repoFullName: selectedRepo?.fullName,
      branch,
      conversationId,
    },
    fetch: async (url, options) => {
      const response = await fetch(url, options);
      const newId = response.headers.get("X-Conversation-Id");
      if (newId && newId !== conversationId) {
        setConversationId(newId);
        window.history.pushState({}, '', `/dashboard/codechat?conversation=${newId}`);
        if (selectedRepo) fetchConversations(selectedRepo.fullName);
      }
      return response;
    }
  }), [selectedRepo?.fullName, branch, conversationId]);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput("");
    setTerminalHistory(prev => [...prev, `$ ${cmd}`]);
    
    if (!selectedRepo) {
      setTerminalHistory(prev => [...prev, "Error: No repository selected."]);
      return;
    }

    const parts = cmd.split(" ");
    if (parts[0] !== "git") {
      setTerminalHistory(prev => [...prev, "Command not found. Only 'git' is supported."]);
      return;
    }

    const command = parts[1];
    const args = parts.slice(2);

    try {
      const res = await fetch("/api/codechat/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: selectedRepo.fullName, command, args })
      });
      const data = await res.json();
      if (data.error) {
        setTerminalHistory(prev => [...prev, `Error: ${data.error}`]);
      } else {
        setTerminalHistory(prev => [...prev, data.output]);
      }
    } catch (err) {
      setTerminalHistory(prev => [...prev, "Error executing command."]);
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory, isTerminalOpen]);

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
            entry.loaded && entry.children && entry.children.length > 0 ? (
              <FolderOpen size={16} className="text-accent-amber shrink-0" />
            ) : (
              <Folder size={16} className="text-accent-amber shrink-0" />
            )
          ) : (
            <FileCode2 size={14} className="shrink-0" />
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
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-4rem)] bg-canvas-default text-on-surface">
      {/* LEFT SIDEBAR: Scoped Context & Symbol Tree */}
      <aside className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0 bg-canvas-subtle flex flex-col justify-between">
        <div className="flex flex-col p-space-md gap-space-md">
          {/* Repo & Branch Metadata Card */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Database size={18} className="text-accent-green-emphasis shrink-0" />
                <select
                  value={selectedRepo?.fullName || ""}
                  onChange={(e) => {
                    const repo = repos.find((r) => r.fullName === e.target.value);
                    if (repo) setSelectedRepo(repo);
                  }}
                  className="bg-canvas-inset w-full font-code-diff text-code-diff text-fg-default font-semibold truncate border border-border-default rounded-md px-2 py-1 outline-none cursor-pointer hover:border-accent-blue transition-colors focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
                >
                  {repos.length === 0 && <option value="">No repos connected</option>}
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
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-accent-purple shrink-0" />
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
              <Search size={16} className="absolute left-2.5 top-2 text-fg-subtle" />
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

        {/* Recent Conversations */}
        <div className="flex flex-col gap-space-xs p-space-md border-t border-border-default flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-ui text-label-ui text-fg-muted tracking-wide uppercase">
              Recent Chats
            </span>
            <button 
              onClick={() => {
                setConversationId(null);
                setMessages([]);
                window.history.pushState({}, '', '/dashboard/codechat');
              }}
              className="p-1 rounded text-fg-subtle hover:text-fg-default hover:bg-surface-container"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.length === 0 ? (
              <div className="text-fg-subtle font-body-sm text-body-sm px-2">No recent chats</div>
            ) : (
              conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setConversationId(c.id);
                    window.history.pushState({}, '', `/dashboard/codechat?conversation=${c.id}`);
                    fetch(`/api/codechat/conversations/${c.id}`)
                      .then(r => r.json())
                      .then(d => {
                        if (d.messages) setMessages(d.messages);
                      });
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 font-body-sm text-body-sm truncate transition-colors ${
                    conversationId === c.id ? "bg-surface-container text-fg-default" : "text-fg-subtle hover:text-fg-default hover:bg-surface-container-low"
                  }`}
                >
                  <MessageCircle size={14} className="shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))
            )}
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
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className={`ml-2 p-1.5 rounded-lg transition-colors flex items-center gap-2 font-badge-mono text-badge-mono ${
                isTerminalOpen ? 'bg-accent-blue text-white' : 'hover:bg-surface-container-high text-fg-muted hover:text-fg-default'
              }`}
            >
              <Terminal size={16} />
              <span>Git Terminal</span>
            </button>
          </div>

          {showCodeViewer && selectedFile && (
            <div className="flex items-center gap-2">
              <span className="font-code-diff text-code-diff bg-canvas-inset px-2 py-1 rounded text-fg-muted">
                {selectedFile.path}
              </span>
              <button
                onClick={() => setShowCodeViewer(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-fg-muted hover:text-fg-default transition-colors"
              >
                <X size={18} />
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
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-space-md py-space-md space-y-6 bg-canvas-default min-h-0 flex flex-col">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-surface-container border border-border-default flex items-center justify-center text-fg-muted shadow-sm">
                  <MessageSquare size={32} />
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
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5 border border-border-default shadow-sm">
                        <User size={16} className="text-fg-default" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Bot size={18} className="text-accent-purple" />
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
                          {toolCalls.map((tc: any, i: number) => {
                            const proposalKey = `${m.id}-${i}`;

                            // Render DiffViewer for proposeChange results
                            if (
                              tc.toolName === "proposeChange" &&
                              tc.state === "result" &&
                              tc.result?.type === "propose_change"
                            ) {
                              // Already applied — show PR link
                              if (appliedProposals[proposalKey]) {
                                const pr = appliedProposals[proposalKey];
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 font-code-diff text-code-diff bg-diff-addition-line text-diff-addition-text rounded-md px-3 py-2"
                                  >
                                    <GitMerge size={16} />
                                    <span>PR #{pr.prNumber} created</span>
                                    <a
                                      href={pr.prUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-auto underline hover:opacity-80 transition-opacity"
                                    >
                                      View on GitHub →
                                    </a>
                                  </div>
                                );
                              }

                              // Discarded
                              if (discardedProposals.has(proposalKey)) {
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 font-code-diff text-code-diff text-fg-subtle bg-surface-container rounded-md px-3 py-2 opacity-60"
                                  >
                                    <X size={14} />
                                    <span>Change to {tc.result.path} discarded</span>
                                  </div>
                                );
                              }

                              // Pending — show DiffViewer
                              return (
                                <DiffViewer
                                  key={i}
                                  path={tc.result.path}
                                  oldContent={tc.result.oldContent}
                                  newContent={tc.result.newContent}
                                  sha={tc.result.sha}
                                  explanation={tc.result.explanation}
                                  repoFullName={tc.result.repoFullName}
                                  onApply={(result) => {
                                    setAppliedProposals((prev) => ({
                                      ...prev,
                                      [proposalKey]: result,
                                    }));
                                  }}
                                  onDiscard={() => {
                                    setDiscardedProposals((prev) => {
                                      const next = new Set(prev);
                                      next.add(proposalKey);
                                      return next;
                                    });
                                  }}
                                />
                              );
                            }

                            // Other tool calls: same as before
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 font-code-diff text-code-diff text-fg-muted bg-surface-container rounded-md px-3 py-2"
                              >
                                <Search size={14} />
                                <span>
                                  {tc.toolName === "readFile"
                                    ? `Reading ${tc.args?.path}`
                                    : tc.toolName === "listDirectory"
                                      ? `Listing ${tc.args?.path || "/"}`
                                      : tc.toolName === "proposeChange"
                                        ? `Proposing change to ${tc.args?.path}`
                                        : `Searching: ${tc.args?.query}`}
                                </span>
                                {tc.state === "result" && (
                                  <span className="text-diff-addition-text ml-auto">✓</span>
                                )}
                                {tc.state === "call" && (
                                  <span className="animate-pulse ml-auto">...</span>
                                )}
                              </div>
                            );
                          })}
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

        {isTerminalOpen && (
          <div className="h-64 border-t border-border-default bg-canvas-inset flex flex-col font-code-diff text-code-diff shrink-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-fg-muted whitespace-pre-wrap">
              {terminalHistory.map((line, i) => (
                <div key={i} className={line.startsWith("$") ? "text-fg-default" : "opacity-80"}>
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
            <form onSubmit={handleTerminalSubmit} className="flex items-center p-2 border-t border-border-default bg-canvas-default">
              <span className="text-accent-blue font-bold px-2">$</span>
              <input
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-fg-default"
                placeholder="git status"
                autoFocus
              />
            </form>
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
              className="absolute right-2 bottom-2 w-8 h-8 bg-accent-green-emphasis hover:bg-accent-green-hover text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-30 shadow-md"
            >
              <ArrowUp size={18} />
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

export default function CodeChatClient({ repos }: { repos: RepoInfo[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-fg-subtle">Loading...</div>}>
      <CodeChatClientContent repos={repos} />
    </Suspense>
  );
}
