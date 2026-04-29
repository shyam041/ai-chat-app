interface Chunk {
  text: string;
  source: string; // which document it came from
  index: number; // position in the document
}

export function chunkText(
  text: string,
  source: string,
  chunkSize = 500,
  overlap = 100,
): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      text: text.slice(start, end),
      source,
      index: index++,
    });
    start += chunkSize - overlap; // overlap so we don't cut sentences in half
  }

  return chunks;
}
