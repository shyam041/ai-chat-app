// src/lib/vectorStore.ts
import { embedTexts, embedQuery } from "./embeddings";
import { chunkText } from "./chunker";

interface StoredChunk {
  text: string;
  source: string;
  index: number;
  embedding: number[];
}

// In-memory store (replace with Pinecone/Supabase in production)
const store: StoredChunk[] = [];

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// INDEX: add a document to the store
export async function indexDocument(text: string, source: string) {
  const chunks = chunkText(text, source);
  const embeddings = await embedTexts(chunks.map((c) => c.text));

  chunks.forEach((chunk, i) => {
    store.push({ ...chunk, embedding: embeddings[i] });
  });

  console.log(`Indexed ${chunks.length} chunks from ${source}`);
}

// SEARCH: find relevant chunks for a query
export async function search(query: string, topK = 4): Promise<(StoredChunk & { score: number })[]> {
  const queryEmbedding = await embedQuery(query);

  const scored = store.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
