import { routeRequest, agents } from "@/lib/agent";
import { streamResearch } from "@/lib/ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);
  const lastMessage = messages[messages.length - 1];
  const lastText =
    lastMessage.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";

  const category = await routeRequest(lastText);
  console.log("Routed to:", category);

  if (category === "research") {
    const result = streamResearch(modelMessages, agents.research.maxSteps);
    return result.toUIMessageStreamResponse();
  }

  const agent = agents[category as keyof typeof agents] ?? agents.chat;
  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: agent.system,
    messages: modelMessages,
    tools: agent.tools,
    maxOutputTokens: 4096,
    stopWhen: stepCountIs(agent.maxSteps),
  });

  return result.toUIMessageStreamResponse();
}
