# Document Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.md` file upload to the UI — files are chunked, embedded via OpenAI, and stored in the in-memory vector store, with a `/documents` page listing all indexed docs.

**Architecture:** A new route group `app/(main)/` shares a persistent sidebar+header shell (`AppShell`) across the chat page and the new `/documents` page. A new `lib/docRegistry.ts` module holds upload metadata in memory (same lifetime as the vector store). Two new API routes handle listing docs (`GET /api/docs`) and uploading (`POST /api/upload-doc`).

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS, Vercel AI SDK v6, OpenAI `text-embedding-3-small` (via `@ai-sdk/openai`)

---

## File Map

| Path | Action | Responsibility |
|------|--------|---------------|
| `lib/docRegistry.ts` | Create | In-memory `DocMeta[]` with `addDoc` / `listDocs` |
| `lib/vectorStore.ts` | Modify | `indexDocument` returns `Promise<number>` (chunk count) |
| `app/api/docs/route.ts` | Create | `GET` — returns `listDocs()` as JSON |
| `app/api/upload-doc/route.ts` | Create | `POST multipart/form-data` — validates, indexes, registers |
| `components/AppShell.tsx` | Create | Client shell: header + collapsible sidebar + `{children}` slot |
| `app/(main)/layout.tsx` | Create | Route-group layout — renders `<AppShell>` |
| `app/(main)/page.tsx` | Create | Chat page (replaces `app/page.tsx`) — renders `<Chat />` |
| `app/page.tsx` | Delete | Replaced by `app/(main)/page.tsx` |
| `app/(main)/documents/page.tsx` | Create | Documents list page with upload button and toast |
| `components/UploadModal.tsx` | Create | File picker modal with loading state |
| `components/Sidebar.tsx` | Modify | Add Documents `<Link>` with active state via `usePathname` |

---

### Task 1: `lib/docRegistry.ts`

**Files:**
- Create: `lib/docRegistry.ts`

- [ ] **Step 1: Create the registry module**

```typescript
import { randomUUID } from "crypto";

export interface DocMeta {
  id: string;
  filename: string;
  uploadedAt: string;
  chunkCount: number;
}

const registry: DocMeta[] = [];

export function addDoc(filename: string, chunkCount: number): DocMeta {
  const doc: DocMeta = {
    id: randomUUID(),
    filename,
    uploadedAt: new Date().toISOString(),
    chunkCount,
  };
  registry.push(doc);
  return doc;
}

export function listDocs(): DocMeta[] {
  return [...registry];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds (or fails only on pre-existing errors unrelated to this file).

- [ ] **Step 3: Commit**

```bash
git add lib/docRegistry.ts
git commit -m "feat: add in-memory doc metadata registry"
```

---

### Task 2: Modify `lib/vectorStore.ts` — return chunk count

**Files:**
- Modify: `lib/vectorStore.ts`

`indexDocument` currently returns `void`. Changing it to return `Promise<number>` lets the upload route report how many chunks were created without calling `chunkText` twice.

- [ ] **Step 1: Update `indexDocument` signature and return value**

Change the function from:
```typescript
export async function indexDocument(text: string, source: string) {
  const chunks = chunkText(text, source);
  const embeddings = await embedTexts(chunks.map((c) => c.text));

  chunks.forEach((chunk, i) => {
    store.push({ ...chunk, embedding: embeddings[i] });
  });

  console.log(`Indexed ${chunks.length} chunks from ${source}`);
}
```

To:
```typescript
export async function indexDocument(text: string, source: string): Promise<number> {
  const chunks = chunkText(text, source);
  const embeddings = await embedTexts(chunks.map((c) => c.text));

  chunks.forEach((chunk, i) => {
    store.push({ ...chunk, embedding: embeddings[i] });
  });

  console.log(`Indexed ${chunks.length} chunks from ${source}`);
  return chunks.length;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds. Existing callers of `indexDocument` that ignore the return value are unaffected.

- [ ] **Step 3: Commit**

```bash
git add lib/vectorStore.ts
git commit -m "feat: indexDocument returns chunk count"
```

---

### Task 3: `app/api/docs/route.ts`

**Files:**
- Create: `app/api/docs/route.ts`

- [ ] **Step 1: Create the GET handler**

```typescript
import { listDocs } from "@/lib/docRegistry";

export async function GET() {
  return Response.json(listDocs());
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/docs/route.ts
git commit -m "feat: GET /api/docs returns doc registry"
```

---

### Task 4: `app/api/upload-doc/route.ts`

**Files:**
- Create: `app/api/upload-doc/route.ts`

Accepts `multipart/form-data` with a field named `file`. Validates extension and non-empty content, indexes the document, registers metadata.

- [ ] **Step 1: Create the POST handler**

```typescript
import { indexDocument } from "@/lib/vectorStore";
import { addDoc } from "@/lib/docRegistry";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".md")) {
    return Response.json({ error: "Only .md files are accepted" }, { status: 400 });
  }

  const content = await file.text();

  if (!content.trim()) {
    return Response.json({ error: "File is empty" }, { status: 400 });
  }

  const chunkCount = await indexDocument(content, file.name);
  addDoc(file.name, chunkCount);

  return Response.json({ filename: file.name, chunkCount });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/upload-doc/route.ts
git commit -m "feat: POST /api/upload-doc indexes .md files"
```

---

### Task 5: `components/AppShell.tsx` + Route Group Layout

**Files:**
- Create: `components/AppShell.tsx`
- Create: `app/(main)/layout.tsx`
- Create: `app/(main)/page.tsx`
- Delete: `app/page.tsx`

The current `app/page.tsx` owns the header, sidebar, and chat. We extract the header+sidebar into `AppShell` (a client component), put it in a route group layout so it wraps both `/` and `/documents`, and slim `page.tsx` down to just `<Chat />`.

- [ ] **Step 1: Create `components/AppShell.tsx`**

```tsx
"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 h-12 shrink-0 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <span className="font-semibold text-sm tracking-tight">Claude Chat</span>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create the route group directories**

```bash
mkdir -p "app/(main)/documents"
```

- [ ] **Step 3: Create `app/(main)/layout.tsx`**

```tsx
import AppShell from "@/components/AppShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 4: Create `app/(main)/page.tsx`**

```tsx
import Chat from "@/components/Chat";

export default function Home() {
  return <Chat />;
}
```

- [ ] **Step 5: Delete `app/page.tsx`**

```bash
rm app/page.tsx
```

Both `app/page.tsx` and `app/(main)/page.tsx` serve the same `/` route — having both causes a Next.js build error. Deleting `app/page.tsx` lets the route group version take over.

- [ ] **Step 6: Verify TypeScript compiles and dev server starts**

```bash
npm run build
```

Expected: Build succeeds. Then start dev server and confirm `http://localhost:3000` still shows the chat UI with header and sidebar.

```bash
npm run dev
```

- [ ] **Step 7: Commit**

```bash
git add components/AppShell.tsx "app/(main)/layout.tsx" "app/(main)/page.tsx"
git rm app/page.tsx
git commit -m "refactor: extract AppShell, move to route group layout"
```

---

### Task 6: `components/UploadModal.tsx`

**Files:**
- Create: `components/UploadModal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (filename: string, chunkCount: number) => void;
  onError: (message: string) => void;
}

export default function UploadModal({ onClose, onSuccess, onError }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-doc", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Upload failed");
      } else {
        onSuccess(data.filename, data.chunkCount);
      }
    } catch {
      onError("Network error — please try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Upload Document</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".md"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
              {file.name}
            </p>
          ) : (
            <p className="text-sm text-neutral-400">
              Click to select a <span className="font-mono">.md</span> file
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/UploadModal.tsx
git commit -m "feat: add UploadModal component"
```

---

### Task 7: `app/(main)/documents/page.tsx`

**Files:**
- Create: `app/(main)/documents/page.tsx`

- [ ] **Step 1: Create the documents page**

```tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, Upload } from "lucide-react";
import UploadModal from "@/components/UploadModal";
import type { DocMeta } from "@/lib/docRegistry";

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const fetchDocs = async () => {
    const res = await fetch("/api/docs");
    if (res.ok) setDocs(await res.json());
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSuccess = (filename: string, chunkCount: number) => {
    setShowModal(false);
    setToast({
      message: `Indexed '${filename}' — ${chunkCount} chunks`,
      type: "success",
    });
    fetchDocs();
  };

  const handleError = (message: string) => {
    setShowModal(false);
    setToast({ message, type: "error" });
  };

  return (
    <section className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h1 className="font-semibold text-base">Documents</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <FileText className="w-10 h-10 opacity-30" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                <th className="pb-2 font-medium">Filename</th>
                <th className="pb-2 font-medium">Uploaded</th>
                <th className="pb-2 font-medium text-right">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="py-3 font-mono text-xs">{doc.filename}</td>
                  <td className="py-3 text-neutral-500">
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-neutral-500">{doc.chunkCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl text-white text-sm shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "app/(main)/documents/page.tsx"
git commit -m "feat: add /documents page with doc listing and upload"
```

---

### Task 8: Modify `components/Sidebar.tsx` — add Documents link

**Files:**
- Modify: `components/Sidebar.tsx`

Add a "Documents" `<Link>` between the "New Chat" button and the "Recent" section. Use `usePathname` to highlight it when on `/documents`. Collapsed state shows only the icon.

- [ ] **Step 1: Replace the full contents of `components/Sidebar.tsx`**

```tsx
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
        <button
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-neutral-800 dark:bg-neutral-700 text-white text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </button>

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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 3: Smoke test in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Sidebar shows "Documents" link below "New Chat"
- Clicking "Documents" navigates to `/documents` — link highlights blue
- `/documents` shows empty state with file icon
- Clicking "Upload Document" opens the modal
- Selecting a `.md` file shows the filename in the modal
- Uploading succeeds → modal closes, toast shows "Indexed 'filename.md' — N chunks", doc appears in table
- Uploading a non-`.md` file is blocked by the browser file picker (`accept=".md"`)
- Clicking back to chat (via sidebar or browser back) works normally

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: add Documents nav link to sidebar"
```
