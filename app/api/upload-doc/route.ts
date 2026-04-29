import { indexDocument } from "@/lib/vectorStore";
import { addDoc } from "@/lib/docRegistry";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".md")) {
    return Response.json({ error: "Only .md files are accepted" }, { status: 400 });
  }

  const content = await file.text();

  if (!content.trim()) {
    return Response.json({ error: "File is empty" }, { status: 400 });
  }

  const chunkCount = await indexDocument(content, file.name);
  addDoc(file.name, chunkCount);

  return Response.json({ filename: file.name, chunkCount });
}
