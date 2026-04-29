# Document Upload Design

## Goal

Allow users to upload `.md` files through the UI. On successful indexing the file is chunked, embedded via OpenAI, and stored in the in-memory vector store so the `searchDocs` tool can retrieve it during chat.

## Architecture

```
app/documents/page.tsx          ← new page: doc list + upload button
  └─ GET /api/docs              ← new: returns in-memory doc registry
  └─ UploadModal component      ← new: file picker modal
       └─ POST /api/upload-doc  ← new: receives .md file, indexes it
            ├─ validates extension + non-empty
            ├─ indexDocument(content, filename)  ← existing lib/vectorStore.ts
            └─ pushes { id, filename, uploadedAt, chunkCount } to lib/docRegistry.ts

components/Sidebar.tsx          ← modified: add "Documents" Link + active state
lib/docRegistry.ts              ← new: module-level array, shared by both API routes
```

The `docRegistry` is a plain module-level array — same lifetime as the vector store. Both reset on server restart, keeping them consistent.

## New Files

| Path | Purpose |
|------|---------|
| `lib/docRegistry.ts` | In-memory doc metadata store: `{ id, filename, uploadedAt, chunkCount }[]` with `addDoc` and `listDocs` exports |
| `app/documents/page.tsx` | `/documents` page — lists uploaded docs, hosts upload button and toast |
| `app/api/upload-doc/route.ts` | `POST` — accepts `multipart/form-data` with a `.md` file, validates, indexes, registers |
| `app/api/docs/route.ts` | `GET` — returns `listDocs()` as JSON |
| `components/UploadModal.tsx` | Modal component: file input, filename preview, Upload/Cancel, loading state |

## Modified Files

| Path | What changes |
|------|-------------|
| `components/Sidebar.tsx` | Add `<Link href="/documents">` item between "New Chat" and "Recent"; highlight when pathname is `/documents` |

## Data Model

```typescript
// lib/docRegistry.ts
interface DocMeta {
  id: string;        // crypto.randomUUID()
  filename: string;  // original filename
  uploadedAt: string; // ISO timestamp
  chunkCount: number;
}
```

## Upload Flow

1. User navigates to `/documents`, clicks "Upload Document"
2. `UploadModal` opens — file input restricted to `accept=".md"`
3. User selects file; modal shows filename preview
4. User clicks Upload — modal enters loading state
5. Frontend reads file as text via `FileReader`, POSTs `multipart/form-data` to `/api/upload-doc`
6. Server validates: extension is `.md`, content is non-empty; returns 400 otherwise
7. Server calls `indexDocument(content, filename)` — chunks + embeds via OpenAI `text-embedding-3-small`
8. On success: pushes metadata to `docRegistry`, returns `{ filename, chunkCount }`
9. Frontend closes modal, re-fetches doc list, shows green toast: `"Indexed 'filename.md' — N chunks"`
10. On failure: server returns 4xx/5xx; frontend shows red toast with error message; doc is **not** added to registry

## UI Details

### Sidebar
- "Documents" link sits between "New Chat" button and "Recent" section
- Uses Next.js `<Link>` for navigation
- Active state (highlighted background) when `pathname === '/documents'`
- Collapsed sidebar shows only the icon (use `FileText` from lucide-react)

### `/documents` Page Layout
- Header: "Documents" title left-aligned, "Upload Document" button top-right
- Doc list: table with columns — Filename, Uploaded, Chunks
- Empty state: centered icon + "No documents uploaded yet" message

### UploadModal
- Centered modal with backdrop
- File input (`accept=".md"`); once selected, shows chosen filename
- Upload button disabled until a file is selected
- Loading spinner replaces Upload button text while in-flight
- Cancel closes modal without action

### Toast
- Inline component rendered in `/documents` page
- Auto-dismisses after 3 seconds
- Green background for success, red for error
- No external library

## Environment

Requires `OPENAI_API_KEY` in `.env.local` — used by `lib/embeddings.ts` for `text-embedding-3-small`.

## Constraints

- Only `.md` files accepted (validated client-side via `accept` attribute and server-side by extension check)
- In-memory only — doc list and vector store reset on server restart
- No file size limit enforced beyond what Next.js allows by default (~4MB body)
