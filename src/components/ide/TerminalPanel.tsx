"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalPanelProps {
  files?: Record<string, string>;
}

const PROMPT = "\x1b[32mkareixo\x1b[0m:\x1b[36m~/project\x1b[0m$ ";

export default function TerminalPanel({ files = {} }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const lineBuffer = useRef<string>("");
  const filesRef = useRef(files);

  // Keep filesRef in sync with latest files prop without re-running the effect
  filesRef.current = files;

  useEffect(() => {
    if (typeof window === "undefined" || !terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      theme: {
        background: "#0a0f14",
        foreground: "#ededed",
        cursor: "#4dd8d0",
        selectionBackground: "rgba(77, 216, 208, 0.3)",
        black: "#17202a",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#d946ef",
        cyan: "#4dd8d0",
        white: "#f8fafc",
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    termInstance.current = term;

    const handleResize = () => {
      requestAnimationFrame(() => {
        if (termInstance.current && terminalRef.current && terminalRef.current.clientWidth > 0) {
          fitAddon.fit();
        }
      });
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("ide-resize", handleResize);

    // Boot message — honest about scope
    term.writeln("\x1b[1;36mKareixo Lite Shell\x1b[0m  \x1b[90m(file commands only)\x1b[0m");
    term.writeln("\x1b[90mSupported: ls, cat <file>, echo <text>, pwd, clear\x1b[0m");
    term.writeln("");
    term.write(PROMPT);

    // ── Command interpreter ────────────────────────────────────────────────
    function runCommand(raw: string) {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const [cmd, ...args] = trimmed.split(/\s+/);

      switch (cmd) {
        case "ls": {
          const currentFiles = filesRef.current;
          const names = Object.keys(currentFiles);
          if (names.length === 0) {
            term.writeln("\x1b[90m(no files)\x1b[0m");
          } else {
            names.forEach((f) => {
              const ext = f.split(".").pop() ?? "";
              let color = "37"; // white
              if (["js", "ts", "tsx", "jsx"].includes(ext)) color = "33"; // amber
              else if (ext === "json") color = "32"; // green
              else if (ext === "css") color = "36"; // cyan
              term.writeln(`\x1b[${color}m${f}\x1b[0m`);
            });
          }
          break;
        }

        case "cat": {
          const path = args.join(" ");
          if (!path) {
            term.writeln("\x1b[31mcat: missing file operand\x1b[0m");
            break;
          }
          const content = filesRef.current[path];
          if (content === undefined) {
            term.writeln(`\x1b[31mcat: ${path}: No such file\x1b[0m`);
          } else {
            content.split("\n").forEach((line) => term.writeln(line));
          }
          break;
        }

        case "echo": {
          term.writeln(args.join(" "));
          break;
        }

        case "pwd": {
          term.writeln("/home/kareixo/project");
          break;
        }

        case "clear": {
          term.clear();
          break;
        }

        case "help": {
          term.writeln("\x1b[1mAvailable commands:\x1b[0m");
          term.writeln("  \x1b[36mls\x1b[0m              List project files");
          term.writeln("  \x1b[36mcat <file>\x1b[0m      Print file contents");
          term.writeln("  \x1b[36mecho <text>\x1b[0m     Print text");
          term.writeln("  \x1b[36mpwd\x1b[0m             Print working directory");
          term.writeln("  \x1b[36mclear\x1b[0m           Clear terminal");
          term.writeln("");
          term.writeln("\x1b[90mNote: This is a Lite Shell — real code execution is not supported in-browser.\x1b[0m");
          break;
        }

        default:
          term.writeln(`\x1b[31m${cmd}: command not found\x1b[0m \x1b[90m(type 'help' for available commands)\x1b[0m`);
      }
    }

    // ── Keystroke handler ──────────────────────────────────────────────────
    term.onData((data) => {
      if (data === "\r") {
        // Enter
        term.writeln("");
        runCommand(lineBuffer.current);
        lineBuffer.current = "";
        term.write(PROMPT);
      } else if (data === "\x7f") {
        // Backspace
        if (lineBuffer.current.length > 0) {
          lineBuffer.current = lineBuffer.current.slice(0, -1);
          term.write("\b \b");
        }
      } else if (data >= " " || data === "\t") {
        // Printable character
        lineBuffer.current += data;
        term.write(data);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("ide-resize", handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-cream-50 flex flex-col min-h-0">
      <div className="h-8 border-b border-cream-200 flex items-center px-4 bg-cream-100 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-dusk-700 uppercase tracking-wider pr-3 border-r border-cream-200">Terminal</span>
            <button 
              className="ml-2 text-dusk-500 hover:text-dusk-900 transition-colors p-1 rounded hover:bg-cream-200"
              title="New Terminal (Coming in v2)"
              onClick={() => alert("Multi-terminal support is coming in v2. For now, enjoy the single Lite Shell!")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-coral-400 border border-coral-400/30 bg-coral-400/10 px-1.5 py-0.5 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Lite Shell — file commands only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-dusk-500 hover:text-dusk-900 transition-colors p-1 rounded hover:bg-cream-200"
            onClick={() => termInstance.current?.clear()}
            title="Clear Terminal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
              <polyline points="21 3 21 8 16 8"></polyline>
            </svg>
          </button>
          <div className="w-px h-4 bg-cream-200 mx-1"></div>
          <button
            className="text-dusk-500 hover:text-dusk-900 transition-colors p-1 rounded hover:bg-cream-200"
            title="Close Terminal (Coming in v2)"
            onClick={() => alert("Collapsible terminal panel is coming in v2.")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 p-2 overflow-hidden relative">
        <div ref={terminalRef} className="w-full h-full" />
      </div>
    </div>
  );
}
