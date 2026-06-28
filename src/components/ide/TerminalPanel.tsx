"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      theme: {
        background: "#0a0f14", // slate-950
        foreground: "#ededed", // graphite-100
        cursor: "#4dd8d0",     // cyan-400
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

    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    // Initial message
    term.writeln("\x1b[1;36mKareixo Glass Box IDE\x1b[0m");
    term.writeln("Booting execution environment...");

    // Simulate WebContainer boot / fallback logic
    // WebContainers require Cross-Origin-Opener-Policy: same-origin which breaks standard OAuth flows
    // For V1, we simulate the boot and fallback to a sandboxed shell
    setTimeout(() => {
      term.writeln("\x1b[33m[Warning]\x1b[0m Cross-Origin Isolation not detected.");
      term.writeln("Falling back to sandboxed mock terminal mode.");
      term.writeln("");
      term.write("\x1b[32muser@kareixo\x1b[0m:~/project$ ");
      setIsWebContainerReady(true);
    }, 1500);

    // Basic echo for demo
    term.onData((data) => {
      if (data === '\r') {
        term.writeln("");
        term.write("\x1b[32muser@kareixo\x1b[0m:~/project$ ");
      } else if (data === '\x7f') {
        // Handle backspace
        term.write('\b \b');
      } else {
        term.write(data);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="h-64 bg-slate-950 border-t border-graphite-700 flex flex-col shrink-0">
      <div className="h-8 border-b border-graphite-800 flex items-center px-4 bg-graphite-900 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-graphite-300 uppercase tracking-wider">
            Terminal
          </span>
          {isWebContainerReady && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Fallback Mode
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="text-graphite-500 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button className="text-graphite-500 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
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
