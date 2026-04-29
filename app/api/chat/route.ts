import { AgentCategory } from "@/lib/agent";
import { streamWithAgent, streamSmartChat } from "@/lib/ai";
import { convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      mode,
    }: { messages: UIMessage[]; mode?: AgentCategory | "auto" } = body;
    const modelMessages = await convertToModelMessages(messages);

    let result;

    if (mode && mode !== "auto") {
      // User explicitly picked a mode
      result = streamWithAgent(modelMessages, mode);
    } else {
      // Auto-detect — extract last user text for classification
      const lastMessage = messages[messages.length - 1];
      const lastText =
        lastMessage.parts
          ?.filter(
            (p): p is { type: "text"; text: string } => p.type === "text",
          )
          .map((p) => p.text)
          .join("") ?? "";

      result = await streamSmartChat(modelMessages, lastText);
    }

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
