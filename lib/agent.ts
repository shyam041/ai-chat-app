// src/lib/agents.ts

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import {
  notepad,
  searchWeb,
  readWebPage,
  weatherTool,
  calculatorTool,
  searchDocs,
} from "./tools";

const chatTools = {
  getWeather: weatherTool,
  calculate: calculatorTool,
  searchDocs: searchDocs,
};

const researchTools = {
  notepad,
  searchWeb,
  readWebPage,
};

// Step 1: Router decides which agent handles the request
export async function routeRequest(userMessage: string) {
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    maxOutputTokens: 50,
    messages: [{ role: "user", content: userMessage }],
    system: `Classify the user's request into exactly one category:
      - "research" if they want information gathered from the web
      - "code" if they want code written or reviewed
      - "chat" if it's general conversation
      Respond with ONLY the category word.`,
  });

  return text.trim().toLowerCase();
}

// Step 2: Each agent has its own tools and system prompt
export const agents = {
  research: {
    tools: researchTools,
    system: "You are a research agent...",
    maxSteps: 8,
  },
  chat: {
    tools: chatTools,
    system: "You are a friendly assistant...",
    maxSteps: 3,
  },
};
