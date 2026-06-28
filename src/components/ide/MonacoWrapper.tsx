"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-cream-50">
      <div className="text-dusk-500 font-mono text-sm flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-dusk-400 border-t-coral-400 rounded-full animate-spin" />
        Loading editor...
      </div>
    </div>
  ),
});

interface MonacoWrapperProps {
  file: string;
  content: string;
  onChange: (value: string | undefined) => void;
}

export default function MonacoWrapper({ file, content, onChange }: MonacoWrapperProps) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
    };
    window.addEventListener("ide-resize", handleResize);
    return () => window.removeEventListener("ide-resize", handleResize);
  }, []);

  // Determine language based on extension
  const ext = file.split(".").pop()?.toLowerCase();
  let language = "plaintext";
  
  if (ext === "js" || ext === "jsx") language = "javascript";
  else if (ext === "ts" || ext === "tsx") language = "typescript";
  else if (ext === "json") language = "json";
  else if (ext === "css") language = "css";
  else if (ext === "html") language = "html";
  else if (ext === "md") language = "markdown";

  return (
    <div className="absolute inset-0">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 1.6,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        // Apply custom theme matching Kareixo palette on mount
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monaco.editor.defineTheme("kareixo", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { background: "0a0f14" } // cream-50
            ],
            colors: {
              "editor.background": "#0a0f14",
              "editor.lineHighlightBackground": "#17202a", // cream-100
              "editorLineNumber.foreground": "#4d5b6b", // dusk-500
              "editorIndentGuide.background": "#293645", // cream-300
              "editorIndentGuide.activeBackground": "#4d5b6b", // dusk-500
            }
          });
          monaco.editor.setTheme("kareixo");
        }}
      />
    </div>
  );
}
