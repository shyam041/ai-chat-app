"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 h-12 shrink-0 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-sm tracking-tight">Claude Chat</span>
        </Link>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        {children}
      </div>
    </main>
  );
}
