import { z } from "zod";
import { tool, zodSchema } from "ai";
import { search } from "../vectorStore";

export const searchDocs = tool({
  description: `Search the internal knowledge base for information. 
    Use this when the user asks about company policies, product docs, 
    or anything that might be in internal documentation.`,
  inputSchema: zodSchema(
    z.object({
      query: z.string().describe("What to search for"),
    }),
  ),
  execute: async ({ query }: { query: string }) => {
    const results = await search(query, 4);
    return results.map((r) => ({
      text: r.text,
      source: r.source,
      relevance: r.score,
    }));
  },
});
