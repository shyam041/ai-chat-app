// src/components/Chat.tsx
"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare } from "lucide-react";
import ModeSelector, { type ChatMode } from "./ModeSelector";
import ToolCallDisplay from "./ToolCallDisplay";

export default function Chat() {
  const [mode, setMode] = useState<ChatMode>("auto");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { mode },
    }),
  });

  const [input, setInput] = useState("");
  const isStreaming = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <section className="flex flex-col flex-1 h-full overflow-hidden">
      {/* Mode selector at top */}
      <div className="shrink-0 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 flex justify-center">
        <ModeSelector mode={mode} onModeChange={setMode} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p>Start a conversation</p>
            <p className="text-xs">
              Mode: {mode === "auto" ? "AI will pick the best approach" : mode}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.parts.map((part, i) => {
              // Render text parts
              if (part.type === "text" && part.text.trim()) {
                return (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      }`}
                    >
                      {part.text}
                    </div>
                  </div>
                );
              }

              // Render tool calls
              if (part.type === "tool-invocation") {
                return (
                  <ToolCallDisplay
                    key={i}
                    toolName={part.toolInvocation.toolName}
                    args={part.toolInvocation.args}
                    result={
                      part.toolInvocation.state === "result"
                        ? part.toolInvocation.result
                        : undefined
                    }
                  />
                );
              }

              return null;
            })}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-sm">
              <span className="animate-pulse">●●●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          placeholder={
            mode === "research"
              ? "What should I research?"
              : mode === "code"
                ? "Paste code or describe what to build..."
                : "Type a message..."
          }
          className="flex-1 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? "…" : "Send"}
        </button>
      </form>
    </section>
  );
}
