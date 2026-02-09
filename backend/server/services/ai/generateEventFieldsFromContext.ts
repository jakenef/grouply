import { ChatMessage } from "@/backend/generated/prisma";
import { zodTextFormat } from "openai/helpers/zod";
import z from "zod";
import { openai } from "../../openai";
import { getActivitiesFromDesc } from "../activity/getActivityFromDesc";

export async function generateEventFieldsFromContext(params: {
  messages: ChatMessage[];
}): Promise<{
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  maxAttendees: number;
  minAttendees: number;
  activityId: string | null;
}> {
  let input: any[] = params.messages.map((m) => ({
    role: m.role.toLowerCase() as any,
    content: m.body,
  }));

  const TextEventDetailsSchema = z.object({
    eventName: z.string(),
    eventDescription: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    maxAttendees: z.number(),
    minAttendees: z.number(),
  });

  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString();
  const readableDate = currentDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const aiResponse = await openai.responses.parse({
    model: "gpt-4o-mini",
    input,
    instructions: `The current date and time is ${readableDate} (${formattedCurrentDate}).

    The user has had a conversation with you about what kind of event they would like to attend. They have decided to host their own event instead of searching for an existing one. You will generate this prospective event's fields for the user. 
    
    Use the messages input as context for what the user wants and make your best guess for each field if there is not enough information. When the user mentions relative times like "this weekend", "next week", "tonight", "tomorrow", etc., calculate the actual date and time based on the current date provided above.
    
    maxAttendees is the preferred max amount of people attending.
    minAttendees is the minimum number of RSVPs required for the event to be confirmed (not pending). Default to 2 unless the user indicates they want more people.
    
    IMPORTANT: Return startTime and endTime in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Make sure the dates are in the future relative to the current date provided above.`,
    text: {
      format: zodTextFormat(TextEventDetailsSchema, "event_detail_extraction"),
    },
  });

  const activitySuggestion = (
    await getActivitiesFromDesc(
      aiResponse.output_parsed?.eventDescription ?? "",
      true,
    )
  )[0];

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
    minAttendees: aiResponse.output_parsed?.minAttendees ?? 2,
    activityId: activitySuggestion?.id ?? null,
  };

  return eventFields;
}
