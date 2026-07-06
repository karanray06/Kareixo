"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Add, Microphone, Setting4, ArrowUp2, CloseCircle, TickCircle, ArrowDown2 } from "iconsax-react";

export default function IdeClient() {
  const [showChecklist, setShowChecklist] = useState(true);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#1a1b1e] w-full">
      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6">
        <div className="w-24"></div>
        
        {/* Brand Center */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-coral-400/20 border border-coral-400/40 glow-cyan">
            <div className="w-2 h-2 border border-coral-300 transform rotate-45" />
          </div>
          <span className="font-display font-bold text-lg text-gray-200">Kareixo</span>
        </div>

        {/* Toggle Right */}
        <div className="flex bg-[#141517] p-1 rounded-lg border border-[#2b2d31]">
          <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-[#2b2d31] text-gray-200 shadow-sm transition-all">
            Agent
          </button>
          <button className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-300 transition-all">
            Ask
          </button>
        </div>
      </div>

      {/* Central Command Interface */}
      <div className="w-full max-w-3xl px-6 flex flex-col gap-4 mt-12 z-10 h-full justify-center">
        {messages.length > 0 && (
          <div className="w-full max-w-3xl flex flex-col gap-4 mb-4 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`p-4 rounded-xl ${m.role === 'user' ? 'bg-[#2b2d31] text-gray-200 self-end ml-12' : 'bg-[#141517] border border-[#2b2d31] text-gray-300 self-start mr-12'}`}>
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-xl bg-[#141517] border border-[#2b2d31] text-gray-400 self-start animate-pulse">
                Agent is thinking...
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative bg-[#141517] border border-[#2b2d31] rounded-2xl p-4 shadow-2xl focus-within:border-[#3b3d41] focus-within:ring-1 focus-within:ring-[#3b3d41] transition-all">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Ask to build features, fix bugs, or work on your code"
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 text-lg resize-none outline-none min-h-[120px]"
          />
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2b2d31]/50">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#202124] rounded-md transition-colors">
                <Add size={20} />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#202124] rounded-md transition-colors">
                <Setting4 size={20} />
              </button>
              <div className="h-4 w-px bg-[#2b2d31] mx-1" />
              <button className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors">
                Normal <ArrowDown2 size={12} />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button type="button" className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#202124] rounded-md transition-colors">
                <Microphone size={20} />
              </button>
              <button type="submit" disabled={isLoading} className="flex items-center bg-coral-500 hover:bg-coral-400 disabled:opacity-50 text-white rounded-full transition-colors cursor-pointer p-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <ArrowUp2 size={18} variant="Bold" />
                </div>
                <div className="pl-1 pr-2 border-l border-white/20">
                  <ArrowDown2 size={12} />
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Onboarding Checklist */}
      {showChecklist && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-[#141517] border border-[#2b2d31] rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="p-3 border-b border-[#2b2d31] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-200">Get started</span>
              <span className="text-xs text-gray-500">4 of 6</span>
            </div>
            <button onClick={() => setShowChecklist(false)} className="text-gray-500 hover:text-gray-300">
              <CloseCircle size={16} />
            </button>
          </div>
          <div className="h-1 bg-[#2b2d31]">
            <div className="h-full bg-coral-500 w-[66%]" />
          </div>
          <div className="flex flex-col p-2">
            <div className="flex items-center gap-3 p-2 text-sm text-gray-400 line-through">
              <TickCircle size={18} className="text-coral-500" variant="Bold" />
              Connect to Git
            </div>
            <div className="flex items-center justify-between p-2 text-sm text-gray-400 line-through">
              <div className="flex items-center gap-3">
                <TickCircle size={18} className="text-coral-500" variant="Bold" />
                Select repositories
              </div>
              <span className="text-xs text-green-400 border border-green-400/20 bg-green-400/10 px-1.5 py-0.5 rounded">Earned $10</span>
            </div>
            <div className="flex items-center gap-3 p-2 text-sm text-gray-200 cursor-pointer hover:bg-[#202124] rounded-md transition-colors">
              <div className="w-[18px] h-[18px] rounded-full border border-gray-500" />
              Make your first session
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
