// src/lib/ai.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, stepCountIs, type ModelMessage } from "ai";
import {
  weatherTool,
  calculatorTool,
  notepad,
  readWebPage,
  searchWeb,
} from "./tools";

const chatTools = {
  getWeather: weatherTool,
  calculate: calculatorTool,
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
    system: `You are a research agent. When given a topic:
1. Search for information using multiple queries
2. Read the most relevant pages for details
3. Save key findings to your notepad
4. After gathering enough information, write a comprehensive summary

Think step by step. Don't rush — do multiple searches if needed.
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
