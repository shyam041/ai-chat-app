import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <header className="shrink-0 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          AI Assistant
        </h1>
        <p className="text-xs text-neutral-500">Chat · Code · Research · RAG</p>
      </header>
      <Chat />
    </main>
  );
}
