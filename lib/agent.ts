import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { chatTools, researchTools } from "./toolSets";

const agentDefinitions = {
  research: {
    tools: researchTools,
    system: `You are a research agent. When given a topic:
1. Create a plan of what to search for
2. Search using 2-3 different queries for breadth
3. Read the 2-3 most relevant pages
4. Save key findings to your notepad
5. Write a comprehensive summary citing sources with URLs

Be thorough but efficient. Stop researching once you have enough to answer well.`,
    maxSteps: 12,
  },
  code: {
    tools: chatTools,
    system: `You are a senior TypeScript and React developer.
When writing code: use TypeScript, add proper types, follow React best practices.
When reviewing code: check for bugs, performance issues, accessibility, and suggest fixes.
When explaining: use analogies to web development concepts.
Always explain your reasoning before showing code.`,
    maxSteps: 5,
  },
  chat: {
    tools: chatTools,
    system: `You are a friendly, knowledgeable assistant. 
Use tools when they'd help answer the question better.
Keep responses concise unless the user asks for detail.`,
    maxSteps: 3,
  },
} as const;

export type AgentCategory = keyof typeof agentDefinitions;
export const agents = agentDefinitions;

export async function routeRequest(
  userMessage: string,
): Promise<AgentCategory> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      maxOutputTokens: 20,
      messages: [{ role: "user", content: userMessage }],
      system: `Classify the user's request into exactly one category:
- "research" — user wants information gathered from the web, news, or current events
- "code" — user wants code written, reviewed, debugged, or explained
- "chat" — general conversation, questions, or anything else
Respond with ONLY the category word, nothing else.`,
    });

    const category = text.trim().toLowerCase();
    if (category in agentDefinitions) {
      return category as AgentCategory;
    }
    return "chat";
  } catch (error) {
    console.error("Router failed, defaulting to chat:", error);
    return "chat";
  }
}
