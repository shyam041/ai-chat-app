// src/lib/tools/calculator.ts
import { tool } from "ai";
import { z } from "zod/v4";
import { zodSchema } from "ai";
import { evaluate } from "mathjs";

export const calculatorTool = tool({
  description: "Perform a math calculation. Use this for any arithmetic.",
  inputSchema: zodSchema(
    z.object({
      expression: z.string().describe("Math expression like '17 * 23 + 45'"),
    }),
  ),
  execute: async ({ expression }) => {
    try {
      const result = evaluate(expression);
      return { expression, result: Number(result) };
    } catch {
      return { expression, error: "Invalid expression" };
    }
  },
});
