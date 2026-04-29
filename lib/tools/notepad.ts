import { z } from "zod";
import { tool, zodSchema } from "ai";

// Simple in-memory store (resets on server restart)
const notes: Array<{ title: string; content: string }> = [];
export const notepad = tool({
  description:
    "Save a note to your scratchpad. Use this to store key findings.",
  inputSchema: zodSchema(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
  execute: async ({ title, content }) => {
    notes.push({ title, content });
    return { saved: true, title, totalNotes: notes.length };
  },
});

export const readNotes = tool({
  description: "Read all saved notes from your scratchpad.",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    return { notes, count: notes.length };
  },
});
