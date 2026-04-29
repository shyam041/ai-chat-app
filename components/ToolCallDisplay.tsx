// src/components/ToolCallDisplay.tsx
"use client";

import { Wrench } from "lucide-react";

interface ToolCallProps {
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export default function ToolCallDisplay({
  toolName,
  args,
  result,
}: ToolCallProps) {
  const friendlyNames: Record<string, string> = {
    getWeather: "Checking weather",
    calculate: "Calculating",
    searchWeb: "Searching the web",
    readWebPage: "Reading page",
    notepad: "Saving notes",
    readNotes: "Reading notes",
    searchDocs: "Searching documents",
  };

  return (
    <div className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 py-1">
      <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <div>
        <span className="font-medium">
          {friendlyNames[toolName] || toolName}
        </span>
        {args && Object.keys(args).length > 0 && (
          <span className="ml-1 text-neutral-400">
            ({Object.values(args).map(String).join(", ")})
          </span>
        )}
      </div>
    </div>
  );
}
