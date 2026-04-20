import { ChatMessageRole } from "@/backend/generated/prisma/client";
import { TRPCError } from "@trpc/server";
import { openai } from "../../openai";
import { prisma } from "../../prisma";
import { getSuggestedEventsFromActivityDesc } from "../event/getSuggestedEventsFromActivityDesc/getSuggestedEventsFromActivityDesc";

/**
 * Call OpenAI API with retry logic and proper error handling
 */
async function callOpenAIWithRetry(
  requestData: any, 
  maxRetries: number = 3
): Promise<any> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt}/${maxRetries} - Calling OpenAI...`);
      
      const response = await openai.responses.create(requestData);
      console.log(`[AI] ✅ OpenAI call successful on attempt ${attempt}`);
      return response;
      
    } catch (error: any) {
      lastError = error;
      console.error(`[AI] ❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        console.error(`[AI] Non-retryable error (${error.status}), aborting`);
        break;
      }
      
      // Don't retry on final attempt
      if (attempt === maxRetries) {
        console.error(`[AI] All ${maxRetries} attempts failed`);
        break;
      }
      
      // Calculate exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10s
      console.log(`[AI] Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed, throw structured error
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'AI service is temporarily unavailable. Please try again later.',
    cause: lastError?.message || 'Unknown AI service error'
  });
}

export async function generateAIResponse(params: {
  channelId: string;
  userId: string;
  numContextMessages?: number;
}) {
  // maybe have options for find by activity first or type of people first? filter / sort optionality
  // 1) Fetch last N messages for context
  const contextMessages = await prisma.chatMessage.findMany({
    where: {
      channelId: params.channelId,
    },
    orderBy: { createdAt: "asc" },
    take: params.numContextMessages ?? 20,
  });

  const instructions = `You are the Grouply app event concierge. You are in charge of helping people find their people. The user is answering the question: What do you want to do? Your goal: Find out what activity the user wants to do, then search for matching events.

  Required information:
  - What activity they want to do (ask until you get this)

  Optional information (pass null if user does not specify):
  - When they'd like to do it (startTime/endTime)

  Don't ask how many people they'd like there unless they offer the information.
  
  Once you are sure you have received all of the users input to these required things, call the tool refreshClientSuggestedEvents() with the correct parameters. 
  
  If you receive events from the tool: Simply tell the user "I've refreshed your event suggestions below! Take a look and let me know if you'd like me to search for something different." IMPORTANT: Do not list the event details out.
  
  If you receive no events from this function: Tell the user there were no events that matched their description and invite them to create an event with AI by clicking below or to try again with a new activity or a different time.
  
  IMPORTANT: Do not use any markdown formatting in your responses. No asterisks, no bold, no italics, no headers. Write in plain text only.`;

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
            description:
              "the number of people the user wants at the event-- pass null if not specified",
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
        required: ["activityDesc"],
        additionalProperties: false,
      },
      strict: false,
    },
  ];

  let input: any[] = contextMessages.map((m) => ({
    role: m.role.toLowerCase(),
    content: m.body,
  }));

  // 2) Call AI, decide if needs Tools
  let aiResponse;
  try {
    aiResponse = await callOpenAIWithRetry({
      model: "gpt-4o-mini",
      input,
      instructions,
      tools: tools,
    });
  } catch (error) {
    // Error already properly structured by callOpenAIWithRetry
    throw error;
  }

  // 3) Handle tooling
  type SuggestedEventsResult = Awaited<
    ReturnType<typeof getSuggestedEventsFromActivityDesc>
  >;
  let latestRefresh: SuggestedEventsResult | undefined = undefined;
  let iterations = 0;
  const MAX_ITERS = 4;

  while (iterations++ < MAX_ITERS) {
    // collect function calls from the response output
    // Function calls are top-level items in the output array, not nested in messages
    const functionCalls = (aiResponse.output ?? []).filter(
      (item: any) => item.type === "function_call",
    ) as any[];

    if (functionCalls.length === 0) break;

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
          },
        );
        latestRefresh = updatedSuggestedEvents;

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
      aiResponse = await callOpenAIWithRetry({
        model: "gpt-4o-mini",
        input,
        tools,
        instructions,
      });
    } catch (error) {
      // Error already properly structured by callOpenAIWithRetry
      throw error;
    }
  }
  // 4) Format AI response for return

  function stripMarkdownAndUrls(text: string): string {
    return (
      text
        // Remove fenced code blocks
        .replace(/```[\s\S]*?```/g, "")

        // Remove inline code
        .replace(/`([^`]*)`/g, "$1")

        // Remove markdown links but keep visible text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

        // Remove raw URLs
        .replace(/https?:\/\/\S+/g, "")

        // Remove bold/italic markers
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/_([^_]+)_/g, "$1")

        // Remove headings
        .replace(/^#{1,6}\s+/gm, "")

        // Remove bullet markers
        .replace(/^\s*[-*+]\s+/gm, "")

        // Clean up excessive whitespace
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }

  const aiChatMessageResponse = {
    authorId: "ai-assistant",
    channelId: params.channelId,
    body: stripMarkdownAndUrls(aiResponse.output_text || ""),
    role: ChatMessageRole.ASSISTANT,
    tools: aiResponse.tools,
  };

  return { aiChatMessageResponse, latestRefresh };
}
