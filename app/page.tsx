"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Chat from "@/components/Chat";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 h-12 shrink-0 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <span className="font-semibold text-sm tracking-tight">Claude Chat</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <Chat />
      </div>
    </main>
  );
}
