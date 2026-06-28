"use client";

import GlassCubeLoader from "../shared/GlassCubeLoader";

interface ThinkingStepProps {
  content: string;
  isStreaming: boolean;
}

export default function ThinkingStep({ content, isStreaming }: ThinkingStepProps) {
  if (!content && !isStreaming) return null;

  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-1">
        {isStreaming ? (
          <GlassCubeLoader />
        ) : (
          <div className="w-8 h-8 rounded-full bg-coral-400/10 border border-coral-400/20 flex items-center justify-center text-coral-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-1 bg-coral-400/5 border border-coral-400/10 rounded-lg p-3">
        <div className="text-xs font-bold text-coral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          Agent Reasoning
          {isStreaming && (
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
        </div>
        <div className="text-sm text-coral-100/80 leading-relaxed whitespace-pre-wrap font-mono">
          {content || "Thinking..."}
        </div>
      </div>
    </div>
  );
}
