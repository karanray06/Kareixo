"use client";

import dynamic from "next/dynamic";

const DiffEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.DiffEditor), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] flex items-center justify-center bg-cream-100 border border-cream-300 rounded-md">
      <div className="text-dusk-500 font-mono text-sm animate-pulse">Loading diff view...</div>
    </div>
  ),
});

interface ProposedChangeProps {
  original: string;
  modified: string;
  filename: string;
}

export default function ProposedChange({ original, modified, filename }: ProposedChangeProps) {
  // Simple heuristic for line counts (Monaco handles the real diff)
  const additions = modified.split('\n').filter(l => !original.includes(l)).length;
  const deletions = original.split('\n').filter(l => !modified.includes(l)).length;

  return (
    <div className="mt-2 bg-cream-100 rounded-md overflow-hidden border border-cream-300">
      <div className="flex items-center justify-between px-3 py-2 bg-cream-200 border-b border-cream-300">
        <span className="text-xs font-mono text-dusk-700">{filename}</span>
        <div className="text-xs font-mono">
          <span className="text-green-400">+{additions}</span>
          <span className="text-dusk-500 mx-1">/</span>
          <span className="text-red-400">-{deletions}</span>
        </div>
      </div>
      
      <div className="h-[250px] relative">
        <DiffEditor
          original={original}
          modified={modified}
          language="typescript"
          theme="vs-dark" // Ideally use the custom kareixo theme here too
          options={{
            readOnly: true,
            renderSideBySide: false, // Inline diff is better for small panels
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  );
}
