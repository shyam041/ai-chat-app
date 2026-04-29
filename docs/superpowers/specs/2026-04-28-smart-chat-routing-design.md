# Smart-Chat Routing Design

**Date:** 2026-04-28  
**Status:** Approved

## Summary

Route all chat messages through `/api/smart-chat` instead of `/api/chat`. The smart-chat route classifies each incoming message and dispatches it to the appropriate specialized agent (chat or research), then streams the response back as a UI message stream compatible with `useChat` from `@ai-sdk/react`.

## Data Flow

```
Chat.tsx
  └─ useChat({ api: "/api/smart-chat" })
       └─ POST /api/smart-chat
            ├─ convertToModelMessages(uiMessages)
            ├─ routeRequest(lastMessage) → "chat" | "research" | "code"
            └─ streamText({ model, system, tools, messages, stopWhen })
                 └─ result.toUIMessageStreamResponse()
```

## Changes

### `app/api/smart-chat/route.ts`

- Accept `messages: UIMessage[]` from the request body
- Convert to `ModelMessage[]` via `convertToModelMessages` before passing to `streamText`
- Pass `stopWhen: stepCountIs(agent.maxSteps)` instead of using `maxSteps` as `maxOutputTokens` (bug fix)
- Return `result.toUIMessageStreamResponse()` instead of `result.toTextStreamResponse()`

### `components/Chat.tsx`

- Change `useChat()` to `useChat({ api: "/api/smart-chat" })`
- No other changes — message rendering via `msg.parts` continues to work

### `lib/agent.ts`

- No logic changes; `maxSteps` field values remain (3 for chat, 15 for research)

## Out of Scope

- `lib/ai.ts` — no changes
- `lib/tools.ts` — no changes
- `/api/chat` route — left in place (unused by UI after this change)
- `/api/research` route — left in place

## Agent Routing Logic

Handled by `routeRequest()` in `lib/agent.ts` — a single LLM call that classifies the message into `"chat"`, `"research"`, or `"code"`. Falls back to `agents.chat` for unknown categories.

## Error Handling

No new error handling needed. `streamText` errors propagate through `toUIMessageStreamResponse()` and are surfaced to the client via the existing `useChat` error state.
