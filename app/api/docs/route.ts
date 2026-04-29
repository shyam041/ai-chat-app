import { listDocs } from "@/lib/docRegistry";

export async function GET() {
  return Response.json(listDocs());
}
