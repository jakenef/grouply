import { ChatMessageRole } from "@/backend/generated/prisma/client";
import OpenAI from "openai";
import { prisma } from "../../prisma";
import { getSuggestedEventsFromActivityDesc } from "../event/getSuggestedEventsFromActivityDesc/getSuggestedEventsFromActivityDesc";

export async function generateAIResponse(params: {
  channelId: string;
  userId: string;
  numContextMessages?: number;
}) {
  // TODO: clean this upp
  // TODO: or create new event suggestion
  // 1) Fetch last N messages for context
  const contextMessages = await prisma.chatMessage.findMany({
    where: {
      channelId: params.channelId,
    },
    orderBy: { createdAt: "asc" },
    take: params.numContextMessages ?? 20,
  });

  // need a getSuggestedEvents(activityDesc, groupSize, startTime, endTime, userid) (tool) or should it be refreshClientSuggestedEvents(...)?
  // websearch tool
  // need a getActivity(name, desc) (service)
  // need a generateEvent(activityDesc, groupSize, time) (service, uses convo id)
  const tools: any[] = [
    { type: "web_search" },
    {
      type: "function" as const,
      name: "refreshClientSuggestedEvents",
      description:
        "Get a list of events that the user might want to attend, based on the information from the current conversation. Returns events ordered by matchScore descending, or none if no events match criteria",
      parameters: {
        type: "object",
        properties: {
          activityDesc: {
            type: "string",
            description:
              "a string describing the activity the user wants-- the more detailed, the better the match will be",
          },
          groupSize: {
            type: "number",
            description: "the number of people the user wants at the event",
          },
          startTime: {
            type: "string",
            format: "date-time",
            description:
              "the start of the window of time the user is available for this event in ISO 8601 format",
          },
          endTime: {
            type: "string",
            format: "date-time",
            description:
              "the end of the window of time the user is available for this event in ISO 8601 format",
          },
        },
        required: ["activityDesc", "groupSize", "startTime", "endTime"],
        additionalProperties: false,
      },
      strict: true,
    },
  ];

  let input: any[] = contextMessages.map((m) => ({
    role: m.role as any,
    content: m.body,
  }));

  // 2) Call AI, decide if needs Tools
  const client = new OpenAI();
  let aiResponse = await client.responses.create({
    model: "gpt-4o-mini",
    input,
    instructions: `You are the Grouply app event concierge. You are in charge of helping people find their people. The user is answering the question: What do you want to do? Always try to find these things out from the user as the conversation goes:
    1. What activity the user would like to do (required)
    2. When the user would like to do it (required)
    3. What shared interests or traits do you want to have with other people (what kind of people) (optional)
    4. How many people they would prefer at the event (optional)
    Once you are sure you have recieved all of the users input to these required things, call the tool refreshClientSuggestedEvents() with the correct parameters. If you recieve events, tell the user you updated their suggested events. If you recieve no events from this function, tell the user there was no events that matched their description and invite them to try again with a new activity or other new parameters.
    `,
    tools: tools,
  });

  // 3) Handle tooling
  let latestRefresh: any | undefined;
  let iterations = 0;
  const MAX_ITERS = 4;

  while (iterations++ < MAX_ITERS) {
    // collect function calls from the response output
    // Function calls are top-level items in the output array, not nested in messages
    const functionCalls = (aiResponse.output ?? []).filter(
      (item: any) => item.type === "function_call"
    ) as any[];

    if (functionCalls.length === 0) break;

    console.log("~~~ Function calls detected: ", functionCalls);

    // Add the assistant's response (which includes the function calls) to the input
    // The Responses API needs to see the full conversation flow
    for (const outputItem of aiResponse.output ?? []) {
      input.push(outputItem as any);
    }

    // Execute function calls and collect outputs
    for (const call of functionCalls) {
      const args = JSON.parse(call.arguments ?? "{}");
      if (call.name === "refreshClientSuggestedEvents") {
        const updatedSuggestedEvents = await getSuggestedEventsFromActivityDesc(
          {
            activityDescription: args.activityDesc,
            groupSize: args.groupSize,
            startTimeString: args.startTime,
            endTimeString: args.endTime,
            userId: params.userId,
          }
        );
        latestRefresh = updatedSuggestedEvents;
        console.log(
          "~~~ Refreshed updatedSuggestedEvents ~~~ with: ",
          updatedSuggestedEvents
        );

        // Add the function output to input array
        input.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(updatedSuggestedEvents),
        } as any);
      }
    }

    // Make another API call with the function outputs
    // The input must not be empty
    if (input.length === 0) {
      console.error("Input array is empty! Breaking loop.");
      break;
    }

    try {
      aiResponse = await client.responses.create({
        model: "gpt-4o-mini",
        input,
        tools,
        instructions: `You are the Grouply app event concierge. You are in charge of helping people find their people. The user is answering the question: What do you want to do? Always try to find these things out from the user as the conversation goes:
    1. What activity the user would like to do (required)
    2. When the user would like to do it (required)
    3. What shared interests or traits do you want to have with other people (what kind of people) (optional)
    4. How many people they would prefer at the event (optional)
    Once you are sure you have recieved all of the users input to these required things, call the tool refreshClientSuggestedEvents() with the correct parameters. If you recieve events, tell the user you updated their suggested events. If you recieve no events from this function, tell the user there was no events that matched their description and invite them to try again with a new activity or other new parameters.
    `,
      });
    } catch (error) {
      console.error("!!! Error making second API call:", error);
      console.error("!!! Input was:", JSON.stringify(input, null, 2));
      throw error;
    }
  }
  // 4) Format AI response for return
  console.log("--- ai response: ", aiResponse.output_text);
  console.info(" $ Current Events On Client $: ", latestRefresh);

  const aiChatMessageResponse = {
    authorId: "ai-assistant",
    channelId: params.channelId,
    body: aiResponse.output_text,
    role: ChatMessageRole.assistant,
    tools: aiResponse.tools,
  };

  // probably need to include events in response
  return aiChatMessageResponse;
}
