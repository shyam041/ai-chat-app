// src/app/api/index-docs/route.ts
import { indexDocument } from "@/lib/vectorStore";

export async function POST(req: Request) {
  const { documents } = await req.json();
  for (const doc of documents) {
    await indexDocument(doc.text, doc.source);
  }

  return Response.json({ status: "indexed", count: documents.length });
}
