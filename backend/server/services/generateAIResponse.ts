import { ChatMessageRole } from "@/backend/generated/prisma/client";
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
  console.log(contextMessages);

  // 2) Call AI, decide if needs Tools
  const client = new OpenAI();
  const initialAIResponse = await client.responses.create({
    model: "gpt-4o-mini",
    input: contextMessages.reverse().map((m) => ({
      role: m.role as any,
      content: m.body,
    })),
  });

  // 3) Handle tooling

  // 4) Format AI response for return
  console.log("ai response:", initialAIResponse);

  const aiChatMessageResponse = {
    authorId: "ai-assistant",
    channelId: params.channelId,
    body: initialAIResponse.output_text,
    role: ChatMessageRole.assistant,
  };

  return aiChatMessageResponse;
}
