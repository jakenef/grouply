import OpenAI from "openai";
import { prisma } from "../prisma";

export async function generateAIResponse(params: {
  channelId: string;
  numContextMessages?: number;
}) {
  // 1) Fetch last N messages for context
  const contextMessages = await prisma.chatMessage.findMany({
    where: {
      channelId: params.channelId,
    },
    orderBy: { createdAt: "desc" },
    take: params.numContextMessages ?? 20,
  });

  console.log("contextMessages length: ", contextMessages.length);

  // 2) Call AI, decide if needs Tools (openAI?)
  const client = new OpenAI();
  const initialAIResponse = await client.responses.create({
    model: "gpt-5-nano",
    input: contextMessages.reverse().map((m) => ({
      role: m.role as any,
      content: m.body,
    })),
  });

  console.log("ai response:", initialAIResponse);

  return initialAIResponse.output_text;

  // 3) Handle tooling
  // 4) Save AI response and format for return
}
