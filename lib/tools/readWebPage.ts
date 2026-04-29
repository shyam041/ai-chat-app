import { z } from "zod";
import { tool, zodSchema } from "ai";

export const readWebPage = tool({
  description:
    "Read the full content of a web page. Use after searching to get detailed information.",
  inputSchema: zodSchema(
    z.object({
      url: z.string().describe("The URL to read"),
    }),
  ),
  execute: async ({ url }: { url: string }) => {
    const res = await fetch(url);
    const html = await res.text();
    // Strip HTML tags (simplified — use cheerio in production)
    const text = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 3000);
    return { url, content: text };
  },
});
