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

  // need a getSuggestedEvents(activityDesc, groupSize, startTime, endTime) (tool)
  // websearch tool
  // need a getActivity(name, desc) (service)
  // need a generateEvent(activityDesc, groupSize, time) (service, uses convo id)
  const tools = [
    {
      type: "function",
      name: "getSuggestedEvents",
      description: "Get a list of events that the user might want to attend",
      parameters: {
        type: "object",
        properties: {
          activityDesc: {
            type: "string",
            description:
              "a short string describing the activity the user wants",
          },
          groupSize: {
            type: "number",
            description: "the number of people the user wants at the event",
          },
          startTime: {
            type: "Date",
            description:
              "the start of the window of time the user is available for this event",
          },
          endTime: {
            type: "Date",
            description:
              "the end of the window of time the user is available for this event",
          },
          required: ["activityDesc", "groupSize", "startTime", "endTime"],
        },
      },
    },
  ];

  // 2) Call AI, decide if needs Tools
  const client = new OpenAI();
  const initialAIResponse = await client.responses.create({
    model: "gpt-4o-mini",
    input: contextMessages.reverse().map((m) => ({
      role: m.role as any,
      content: m.body,
    })),
    instructions: `You are the Grouply app event concierge. You are in charge of helping people find their people. The user is answering the question: What do you want to do? Always try to find these things out from the user as the conversation goes:
    1. What activity the user would like to do (required)
    2. When the user would like to do it (required)
    3. What shared interests or traits do you want to have with other people (what kind of people) (optional)
    4. How many people they would prefer at the event (optional)
    Once you are sure you have recieved all of the users input to these required things, say DING DING DING at the beginning of every response afterwards. But ONLY after you are sure.
    `,
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
