import { z } from "zod";
import { tool, zodSchema } from "ai";

export const searchWeb = tool({
  description:
    "Search the web for information. Use this when you need current or factual information.",
  inputSchema: zodSchema(
    z.object({
      query: z.string().describe("Search query, keep it short and specific"),
    }),
  ),
  execute: async ({ query }: { query: string }) => {
    if (!process.env.TAVILY_API_KEY) {
      return { error: "Web search not configured", results: [] };
    }
    const res = await fetch(
      `https://api.tavily.com/search?q=${encodeURIComponent(query)}&api_key=${process.env.TAVILY_API_KEY}`,
    );
    const data = await res.json();
    return data.results
      .slice(0, 5)
      .map((r: { title: string; content: string; url: string }) => ({
        title: r.title,
        snippet: r.content,
        url: r.url,
      }));
  },
});
