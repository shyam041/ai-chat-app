# Smart-Chat Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route all chat messages through `/api/smart-chat` (which classifies and dispatches to specialized agents) instead of `/api/chat`.

**Architecture:** `useChat` in `Chat.tsx` is pointed at `/api/smart-chat`. That route converts incoming `UIMessage[]` to `ModelMessage[]`, classifies the message via `routeRequest()`, selects the matching agent config, streams with `streamText`, and returns a UI-compatible stream. No new files needed.

**Tech Stack:** Next.js App Router, Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`), TypeScript

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `app/api/smart-chat/route.ts` | Modify | Fix message conversion, stream format, maxSteps bug |
| `components/Chat.tsx` | Modify | Point `useChat` at `/api/smart-chat` |

`lib/agent.ts` — no changes needed.

---

### Task 1: Fix `app/api/smart-chat/route.ts`

**Files:**
- Modify: `app/api/smart-chat/route.ts`

Current file has three bugs:
1. Passes raw `messages` (UIMessage[]) directly to `streamText` — must convert to `ModelMessage[]` first
2. Uses `result.toTextStreamResponse()` — `useChat` needs `toUIMessageStreamResponse()`
3. Passes `agent.maxSteps` as `maxOutputTokens` — should be `stopWhen: stepCountIs(agent.maxSteps)`

- [ ] **Step 1: Rewrite the route**

Replace the entire contents of `app/api/smart-chat/route.ts` with:

```typescript
import { routeRequest, agents } from "@/lib/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);
  const lastMessage = messages[messages.length - 1];
  const lastText =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : lastMessage.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("") ?? "";

  const category = await routeRequest(lastText);
  console.log("Routed to:", category);

  const agent = agents[category as keyof typeof agents] ?? agents.chat;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: agent.system,
    messages: modelMessages,
    tools: agent.tools,
    maxOutputTokens: 4096,
    stopWhen: stepCountIs(agent.maxSteps),
  });

  return result.toUIMessageStreamResponse();
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds with no type errors. (Warnings about `eval` in `calculatorTool` are pre-existing and acceptable.)

- [ ] **Step 3: Commit**

```bash
git add app/api/smart-chat/route.ts
git commit -m "fix: smart-chat route uses UIMessage conversion and correct stream format"
```

---

### Task 2: Point `Chat.tsx` at `/api/smart-chat`

**Files:**
- Modify: `components/Chat.tsx`

`useChat()` with no arguments defaults to POST `/api/chat`. Passing `{ api: "/api/smart-chat" }` redirects it.

- [ ] **Step 1: Update the `useChat` call**

In `components/Chat.tsx`, change line 8 from:

```typescript
  const { messages, sendMessage, status } = useChat();
```

to:

```typescript
  const { messages, sendMessage, status } = useChat({ api: "/api/smart-chat" });
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds with no new errors.

- [ ] **Step 3: Smoke test in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Send a plain chat message (e.g. "Hello"). Verify:
- Response streams in normally
- Typing indicator (●●●) appears while waiting
- Message renders correctly in the chat bubble

Send a research-style message (e.g. "Search the web for latest AI news"). Verify the research agent responds (may take longer due to tool calls).

- [ ] **Step 4: Commit**

```bash
git add components/Chat.tsx
git commit -m "feat: route chat messages through smart-chat agent dispatcher"
```
