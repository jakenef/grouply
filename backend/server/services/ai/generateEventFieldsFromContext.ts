import { ChatMessage } from "@/backend/generated/prisma";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import z from "zod";

export async function generateEventFieldsFromContext(params: {
  messages: ChatMessage[];
}): Promise<{
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  maxAttendees: number;
}> {
  let input: any[] = params.messages.map((m) => ({
    role: m.role as any,
    content: m.body,
  }));

  const TextEventDetailsSchema = z.object({
    eventName: z.string(),
    eventDescription: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    maxAttendees: z.number(),
  });

  const aiClient = new OpenAI();
  const aiResponse = await aiClient.responses.parse({
    model: "gpt-4o-mini",
    input,
    instructions:
      "The user has had a conversation with you about what kind of event they would like to attend. They have decided to host their own event instead of searching for an existing one. You will generate this prospective event's fields for the user. Use the messages input as context for what the user wants and make your best guess for each field if there is not enough information. maxAttendees is the field that is the optimal amount of people attending.",
    text: {
      format: zodTextFormat(TextEventDetailsSchema, "event_detail_extraction"),
    },
  });

  const eventFields = {
    name: aiResponse.output_parsed?.eventName ?? "",
    description: aiResponse.output_parsed?.eventDescription ?? "",
    startTime: aiResponse.output_parsed?.startTime
      ? new Date(aiResponse.output_parsed.startTime)
      : new Date(),
    endTime: aiResponse.output_parsed?.endTime
      ? new Date(aiResponse.output_parsed.endTime)
      : new Date(),
    maxAttendees: aiResponse.output_parsed?.maxAttendees ?? 5,
  };

  return eventFields;
}
