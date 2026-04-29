import { z } from "zod";
import { tool, zodSchema } from "ai";

export const weatherTool = tool({
  description: "Get the current weather for a given city",
  inputSchema: zodSchema(
    z.object({
      city: z.string().describe("The city name"),
    }),
  ),
  execute: async ({ city }: { city: string }) => {
    // In real life, call a weather API here
    // For now, fake it
    const fakeData: Record<string, string> = {
      vijayapura: "35°C, sunny",
      bangalore: "28°C, partly cloudy",
      mumbai: "32°C, humid",
    };
    const weather = fakeData[city.toLowerCase()] || "22°C, clear skies";
    return { city, weather };
  },
});
