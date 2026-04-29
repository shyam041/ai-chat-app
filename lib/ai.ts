// src/lib/ai.ts
import { anthropic } from "@ai-sdk/anthropic";
import { AgentCategory, agents, routeRequest } from "./agent";
import { streamText, stepCountIs, type ModelMessage } from "ai";

// Direct streaming with a specific agent
export function streamWithAgent(
  messages: ModelMessage[],
  agentName: AgentCategory,
) {
  const agent = agents[agentName];

  return streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: agent.system,
    maxOutputTokens: 4096,
    messages,
    tools: agent.tools,
    stopWhen: stepCountIs(agent.maxSteps),
    onStepFinish({ stepType, toolCalls }) {
      if (toolCalls?.length) {
        console.log(
          `[${agentName}] Tools:`,
          toolCalls.map((t) => t.toolName),
        );
      }
      console.log(`[${agentName}] Step type: ${stepType}`);
    },
    onError({ error }) {
      console.error(`[${agentName}] Error:`, error);
    },
    onFinish({ steps, usage }) {
      console.log(
        `[${agentName}] Done — ${steps.length} steps, ${usage.totalTokens} tokens`,
      );
    },
  });
}

// Auto-routed streaming — classifies then delegates
export async function streamSmartChat(
  messages: ModelMessage[],
  userText: string,
) {
  const category = await routeRequest(userText);
  console.log(`[router] "${userText.slice(0, 50)}..." → ${category}`);
  return streamWithAgent(messages, category);
}
