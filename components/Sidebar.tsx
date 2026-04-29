"use client";

import { Plus, ChevronsLeft, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const placeholderChats = [
  "How does React work?",
  "Explain async/await",
  "Write a sorting algorithm",
  "What is TypeScript?",
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 transition-all duration-200 overflow-hidden ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      <div className="p-2 flex flex-col gap-1">
        <Link
          href="/"
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-neutral-800 dark:bg-neutral-700 text-white text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </Link>

        <Link
          href="/documents"
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            pathname === "/documents"
              ? "bg-blue-600 text-white"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Documents</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1">
        {!collapsed && (
          <>
            <p className="px-2 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Recent
            </p>
            {placeholderChats.map((title, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors truncate"
              >
                {title}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="p-2 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-8 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft
            className={`w-4 h-4 transition-transform duration-200 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
