import { streamChat } from "@/lib/ai";
import { convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages, system }: { messages: UIMessage[]; system?: string } =
    await req.json();

  const result = streamChat(await convertToModelMessages(messages), system);

  return result.toUIMessageStreamResponse();
}
