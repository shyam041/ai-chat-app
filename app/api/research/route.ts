import { streamResearch } from "@/lib/ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamResearch(messages);
  return result.toUIMessageStreamResponse();
}
