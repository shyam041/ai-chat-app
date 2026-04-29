import { z } from "zod";
import { tool, zodSchema } from "ai";

export const planTool = tool({
  description: `Create a plan before taking action. Use this FIRST to outline 
    what steps you'll take. Output your plan as a numbered list.`,
  inputSchema: zodSchema(
    z.object({
      goal: z.string().describe("What you're trying to accomplish"),
      steps: z.array(z.string()).describe("Ordered list of steps to take"),
    }),
  ),
  execute: async ({ goal, steps }: { goal: string; steps: string[] }) => {
    console.log(`Plan for: ${goal}`);
    steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    return { goal, steps, status: "plan_created" };
  },
});
