# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

No test suite is configured.

## Architecture

This is a Next.js 16 App Router project. The AI layer is built on the **Vercel AI SDK v6** (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) — not the Anthropic SDK directly (`@anthropic-ai/sdk` is not installed).

### Data flow

All chat goes through a smart routing layer:

```
components/Chat.tsx
  └─ useChat() via DefaultChatTransport({ api: "/api/smart-chat" })
       └─ POST /api/smart-chat  (app/api/smart-chat/route.ts)
            ├─ routeRequest() classifies message → "research" | "chat" | "code"
            ├─ research → streamResearch() from lib/ai.ts  (searchWeb + readWebPage tools)
            └─ chat/code → streamText() with agent config from lib/agent.ts
```

`/api/chat` still exists as a simple passthrough but is no longer used by the UI.

### Agent system (`lib/agent.ts`)

`routeRequest()` makes a cheap 50-token LLM call to classify the user message. `agents` maps category names to `{ tools, system, maxSteps }` configs used by the smart-chat route.

### RAG / doc search

`lib/vectorStore.ts` holds an in-memory chunk store (replace with Pinecone/Supabase for production). Docs are indexed via `POST /api/index-docs` (accepts `{ documents: { text, source }[] }`). The `searchDocs` tool in `lib/tools.ts` queries it and is included in the chat agent's toolset.

Embedding pipeline: `lib/chunker.ts` splits text → `lib/embeddings.ts` calls the Anthropic embeddings API → cosine similarity search in `lib/vectorStore.ts`.

### Key SDK conventions in this version (ai v6 / @ai-sdk v3)

- **Message types:** The frontend works with `UIMessage[]` (has `id`, `role`, `parts[]`). The model layer requires `ModelMessage[]`. Always call `await convertToModelMessages(uiMessages)` before passing to `streamText` / `generateText`.
- **Streaming response:** Route handlers must return `result.toUIMessageStreamResponse()`.
- **Token limit param:** `maxOutputTokens` (not `maxTokens`).
- **Agentic loops:** Use `stopWhen: stepCountIs(n)` — `maxSteps` does not exist in this version.
- **`useChat` API:** Returns `{ messages, sendMessage, status }`. Configure endpoint via `transport: new DefaultChatTransport({ api })`, not `{ api }` directly. Use `status === 'submitted' || status === 'streaming'` for loading state.
- **Rendering message text:** `parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map(p => p.text).join('')`.

### Files

| Path | Purpose |
|------|---------|
| `lib/ai.ts` | `askClaude` (non-streaming), `streamChat` (basic chat), `streamResearch` (agentic web research) |
| `lib/agent.ts` | `routeRequest()` classifier + `agents` config map |
| `lib/tools.ts` | All tool definitions: `weatherTool`, `calculatorTool`, `searchWeb`, `readWebPage`, `notepad`, `searchDocs`, `planTool` |
| `lib/vectorStore.ts` | In-memory RAG store: `indexDocument`, `search` |
| `lib/embeddings.ts` | Anthropic embeddings helpers |
| `lib/chunker.ts` | Text chunking for RAG indexing |
| `app/api/smart-chat/route.ts` | Primary chat endpoint — classifies and dispatches |
| `app/api/chat/route.ts` | Simple streaming endpoint (legacy, unused by UI) |
| `app/api/research/route.ts` | Standalone research endpoint wrapping `streamResearch` |
| `app/api/index-docs/route.ts` | Indexes documents into the vector store |
| `components/Chat.tsx` | Chat UI |
| `components/Sidebar.tsx` | Collapsible sidebar — `collapsed: boolean`, `onToggle: () => void` |
| `hooks/useChat.ts` | Legacy custom hook (unused) |

### Environment

```
ANTHROPIC_API_KEY   # required for all AI calls and chat agents
OPENAI_API_KEY      # required for document embedding (text-embedding-3-small via @ai-sdk/openai)
TAVILY_API_KEY      # required for searchWeb tool (web search)
```
