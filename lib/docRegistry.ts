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
