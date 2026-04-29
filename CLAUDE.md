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

```
components/Chat.tsx
  └─ useChat() from @ai-sdk/react
       └─ POST /api/chat  (app/api/chat/route.ts)
            └─ streamChat() from lib/ai.ts
                 └─ streamText() from ai  →  Anthropic claude-sonnet-4-6
```

### Key SDK conventions in this version (ai v6 / @ai-sdk v3)

- **Message types:** The frontend works with `UIMessage[]` (has `id`, `role`, `parts[]`). The model layer requires `ModelMessage[]` (has `role`, `content`). Always call `await convertToModelMessages(uiMessages)` before passing to `streamText` / `generateText`.
- **Streaming response:** Route handlers must return `result.toUIMessageStreamResponse()` (not `toDataStreamResponse` — that method does not exist in this version).
- **Token limit param:** `maxOutputTokens` (not `maxTokens`).
- **`useChat` API:** Returns `{ messages, sendMessage, status }`. There is no `handleSubmit`, `handleInputChange`, or `isLoading`. Use `status === 'submitted' || status === 'streaming'` to detect in-progress state. Send messages with `sendMessage({ text: string })`.
- **Rendering message text:** Messages have `parts: UIMessagePart[]`. Extract text with `.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map(p => p.text).join('')`.

### Files

| Path | Purpose |
|------|---------|
| `lib/ai.ts` | AI helpers: `askClaude` (non-streaming, single message) and `streamChat` (streaming, conversation) |
| `app/api/chat/route.ts` | POST handler — converts `UIMessage[]` → `ModelMessage[]`, calls `streamChat`, returns UI message stream |
| `components/Chat.tsx` | Chat UI — uses `useChat` from `@ai-sdk/react` |
| `components/Sidebar.tsx` | Collapsible sidebar — receives `collapsed: boolean` and `onToggle: () => void` from `page.tsx` |
| `hooks/useChat.ts` | Legacy custom hook (unused by current UI; `Chat.tsx` uses the SDK hook instead) |

### Environment

Requires `ANTHROPIC_API_KEY` in `.env.local`.
