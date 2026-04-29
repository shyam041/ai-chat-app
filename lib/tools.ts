// src/lib/tools.ts
import { tool, zodSchema } from "ai";
import { z } from "zod";

export const weatherTool = tool({
  description: "Get the current weather for a given city",
  inputSchema: zodSchema(
    z.object({
      city: z.string().describe("The city name"),
    }),
  ),
  execute: async ({ city }: { city: string }) => {
    // In real life, call a weather API here
    // For now, fake it
    const fakeData: Record<string, string> = {
      vijayapura: "35°C, sunny",
      bangalore: "28°C, partly cloudy",
      mumbai: "32°C, humid",
    };
    const weather = fakeData[city.toLowerCase()] || "22°C, clear skies";
    return { city, weather };
  },
});

export const calculatorTool = tool({
  description: "Perform a math calculation. Use this for any arithmetic.",
  inputSchema: zodSchema(
    z.object({
      expression: z.string().describe("Math expression like '17 * 23 + 45'"),
    }),
  ),
  execute: async ({ expression }: { expression: string }) => {
    try {
      // Simple eval (use mathjs in production)
      const result = new Function(`return ${expression}`)();
      return { expression, result };
    } catch {
      return { expression, error: "Invalid expression" };
    }
  },
});

export const searchWeb = tool({
  description:
    "Search the web for information. Use this when you need current or factual information.",
  inputSchema: zodSchema(
    z.object({
      query: z.string().describe("Search query, keep it short and specific"),
    }),
  ),
  execute: async ({ query }: { query: string }) => {
    // In production, use Google Custom Search, Serper, Tavily, etc.
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

export const notepad = tool({
  description:
    "Save a note to your scratchpad. Use this to store key findings as you research.",
  inputSchema: zodSchema(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
  execute: async ({ title, content }: { title: string; content: string }) => {
    // In a real app, store in database or memory
    return { saved: true, title, content };
  },
});

export const planTool = tool({
  description: `Create a plan before taking action. Use this FIRST to outline 
    what steps you'll take. Output your plan as a numbered list.`,
  inputSchema: zodSchema(
    z.object({
      goal: z.string().describe("What you're trying to accomplish"),
      steps: z.array(z.string()).describe("Ordered list of steps to take"),
    }),
  ),
  execute: async ({ goal, steps }: { goal: string; steps: string[] }) => {
    console.log(`Plan for: ${goal}`);
    steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    return { goal, steps, status: "plan_created" };
  },
});
