// src/components/ModeSelector.tsx
"use client";

import { Brain, Code, Search, MessageCircle } from "lucide-react";

export type ChatMode = "auto" | "chat" | "code" | "research";

interface ModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes = [
  {
    id: "auto" as const,
    label: "Auto",
    icon: Brain,
    description: "AI picks the best mode",
  },
  {
    id: "chat" as const,
    label: "Chat",
    icon: MessageCircle,
    description: "General conversation",
  },
  {
    id: "code" as const,
    label: "Code",
    icon: Code,
    description: "Write & review code",
  },
  {
    id: "research" as const,
    label: "Research",
    icon: Search,
    description: "Search the web",
  },
];

export default function ModeSelector({
  mode,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            title={m.description}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
