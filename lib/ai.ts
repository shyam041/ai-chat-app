// src/lib/ai.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, stepCountIs, type ModelMessage } from "ai";
import {
  weatherTool,
  calculatorTool,
  notepad,
  readWebPage,
  searchWeb,
  searchDocs,
} from "./tools";

const chatTools = {
  getWeather: weatherTool,
  calculate: calculatorTool,
  searchDocs: searchDocs,
};

const researchTools = {
  searchWeb,
  readWebPage,
  notepad,
};

// Simple call (for non-streaming tasks like classification, JSON extraction)
export async function askClaude(
  userMessage: string,
  system = "You are a helpful assistant.",
): Promise<string> {
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    maxOutputTokens: 1024,
    messages: [{ role: "user", content: userMessage }],
    tools: chatTools,
  });
  return text;
}

// Streaming call (for chat)
export function streamChat(
  messages: ModelMessage[],
  system = "You are a helpful assistant.",
) {
  return streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    maxOutputTokens: 1024,
    messages,
    tools: chatTools,
    stopWhen: stepCountIs(5),
  });
}

// For research agents, we want to give access to more tools and allow more steps
export function streamResearch(messages: ModelMessage[], maxSteps = 5) {
  return streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: `You are a research agent. Follow this strict sequence:
1. Do 2-3 searches using searchWeb
2. Read 2-3 of the most relevant pages using readWebPage
3. STOP using tools and write your comprehensive summary

You MUST write your final summary after step 3. Do not keep reading pages indefinitely.
Always cite your sources with URLs.`,
    maxOutputTokens: 4096,
    messages,
    tools: researchTools,
    stopWhen: stepCountIs(maxSteps),
    onStepFinish({ toolCalls }) {
      if (toolCalls?.length) {
        console.log(
          "Agent action:",
          toolCalls.map((t) => t.toolName),
        );
      }
    },
  });
}
