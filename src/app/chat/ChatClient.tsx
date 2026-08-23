"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { FiSend, FiUser, FiCpu } from "react-icons/fi";

export default function ChatClient() {
  const { messages, sendMessage, status, error } = useChat();
  const isLoading = status === "streaming" || status === "submitted";
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    try {
      await sendMessage({ role: 'user', parts: [{ type: 'text', text: currentInput }] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-outline)]/20 py-4 px-6 bg-[var(--bg-elevated)] flex justify-between items-center">
        <h1 className="font-display text-xl font-bold">Kareixo Chat</h1>
        <div className="text-xs font-mono bg-[var(--bg-base)] px-3 py-1 rounded-full border border-[var(--color-outline)]/20">
          NVIDIA NIM Powered
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <FiCpu className="w-12 h-12" />
            <p className="text-lg">How can I help you today?</p>
          </div>
        ) : (
          messages.map((m: any) => (
            <div key={m.id || Math.random().toString()} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-[var(--color-mint)]/20 flex items-center justify-center flex-shrink-0">
                  <FiCpu className="text-[var(--color-mint)]" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                m.role === 'user' 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)]' 
                  : 'bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20'
              }`}>
                <div className="whitespace-pre-wrap">
                  {m.parts
                    ? m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
                    : m.content || ""}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[var(--text-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--bg-base)]">
                  <FiUser />
                </div>
              )}
            </div>
          ))
        )}
        
        {error && (
          <div className="bg-[var(--color-coral)]/20 text-[var(--color-coral)] p-4 rounded-xl text-sm border border-[var(--color-coral)]/30">
            {error.message || "An error occurred during generation."}
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--color-outline)]/20">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your code, review best practices, or anything else..."
            className="w-full bg-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-[var(--color-sky-blue)] transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity hover:scale-105"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}
