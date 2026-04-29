import { openai } from "@ai-sdk/openai";
import { embedMany, embed } from "ai";

const embeddingModel = openai.embeddingModel("text-embedding-3-small");

// Embed multiple chunks (for indexing)
export async function embedTexts(texts: string[]) {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });
  return embeddings;
}

// Embed a single query (for searching)
export async function embedQuery(query: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
  });
  return embedding;
}
