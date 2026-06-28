"use client";

import { useState } from "react";

interface TimelineEvent {
  id: string;
  time: string;
  type: "prompt" | "code" | "security" | "apply";
  title: string;
  detail?: string;
  provider?: string;
}

const MOCK_EVENTS: TimelineEvent[] = [
  { id: "1", time: "10:42 AM", type: "prompt", title: "User Prompt", detail: "Implement a basic rate limiter in src/middleware/rateLimiter.js" },
  { id: "2", time: "10:42 AM", type: "code", title: "Generated Code", detail: "+24 lines in rateLimiter.js", provider: "DeepSeek V4" },
  { id: "3", time: "10:42 AM", type: "security", title: "Security Pass", detail: "0 issues found" },
  { id: "4", time: "10:43 AM", type: "apply", title: "Changes Applied", detail: "User approved diff" },
];

export default function SessionTimeline() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute right-6 top-20 bg-cream-200 border border-cream-300 hover:border-coral-400 text-dusk-700 p-2 rounded-full shadow-lg transition-colors z-40 group"
        title="Session Replay"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-cream-100 text-dusk-700 text-xs px-2 py-1 rounded border border-cream-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Session Replay
        </span>
      </button>

      {/* Timeline Sidebar Overlay */}
      <div 
        className={`absolute inset-y-0 right-0 w-80 bg-cream-100 border-l border-cream-300 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-[var(--header-height)] border-b border-cream-300 flex items-center justify-between px-4 shrink-0">
          <h3 className="font-display font-bold text-sm text-dusk-900 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral-400">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Session Replay
          </h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-dusk-500 hover:text-dusk-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-dusk-500 mb-6 font-mono">
            Scrub through agent actions in this session to understand what changed and why.
          </p>

          <div className="relative pl-4 space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-cream-200" />

            {MOCK_EVENTS.map((event, i) => {
              let icon, colorClass, bgClass;
              
              switch(event.type) {
                case "prompt":
                  icon = <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>;
                  colorClass = "text-dusk-700";
                  bgClass = "bg-cream-300";
                  break;
                case "code":
                  icon = <polyline points="16 18 22 12 16 6"></polyline>;
                  colorClass = "text-coral-400";
                  bgClass = "bg-coral-500/20";
                  break;
                case "security":
                  icon = <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>;
                  colorClass = "text-rosegold-400";
                  bgClass = "bg-rosegold-400/20";
                  break;
                case "apply":
                  icon = <polyline points="20 6 9 17 4 12"></polyline>;
                  colorClass = "text-green-400";
                  bgClass = "bg-green-400/20";
                  break;
              }

              return (
                <div key={event.id} className="relative group cursor-pointer">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-cream-100 ${bgClass}`} />
                  
                  <div className="bg-cream-200 rounded-lg p-3 border border-transparent group-hover:border-dusk-400 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-xs font-bold font-display ${colorClass}`}>
                        {event.title}
                      </div>
                      <span className="text-[10px] text-dusk-500 font-mono">{event.time}</span>
                    </div>
                    <div className="text-xs text-dusk-700">
                      {event.detail}
                    </div>
                    {event.provider && (
                      <div className="mt-2 inline-block text-[10px] bg-cream-100 px-1.5 py-0.5 rounded text-dusk-500 border border-cream-300">
                        via {event.provider}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
