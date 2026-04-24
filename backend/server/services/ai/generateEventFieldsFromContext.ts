import { ChatMessage } from "@/backend/generated/prisma";
import { zodTextFormat } from "openai/helpers/zod";
import z from "zod";
import { openai } from "../../openai";
import { getActivitiesFromDesc } from "../activity/getActivityFromDesc";

export async function generateEventFieldsFromContext(params: {
  messages: ChatMessage[];
  timezone?: string;
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

  const timezone = params.timezone ?? "UTC";
  const currentDate = new Date();
  const readableDate = currentDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: timezone,
  });

  // Compute UTC offset server-side so the AI never has to do the conversion
  const localMs = new Date(
    currentDate.toLocaleString("en-US", { timeZone: timezone }),
  ).getTime();
  const utcMs = new Date(
    currentDate.toLocaleString("en-US", { timeZone: "UTC" }),
  ).getTime();
  const offsetMinutes = Math.round((localMs - utcMs) / 60000);
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHH = Math.floor(Math.abs(offsetMinutes) / 60)
    .toString()
    .padStart(2, "0");
  const offsetMM = (Math.abs(offsetMinutes) % 60).toString().padStart(2, "0");
  const utcOffset = `${offsetSign}${offsetHH}:${offsetMM}`;

  const aiResponse = await openai.responses.parse({
    model: "gpt-4o-mini",
    input,
    instructions: `The current date and time is ${readableDate}.
    The user's local timezone is ${timezone} (UTC${utcOffset}).

    The user has had a conversation with you about what kind of event they would like to attend. They have decided to host their own event instead of searching for an existing one. You will generate this prospective event's fields for the user.

    Use the messages input as context for what the user wants and make your best guess for each field if there is not enough information. When the user mentions relative times like "this weekend", "next week", "tonight", "tomorrow", etc., calculate the actual date and time based on the current date provided above.

    maxAttendees is the preferred max amount of people attending.
    minAttendees is the minimum number of RSVPs required for the event to be confirmed (not pending). Default to 2 unless the user indicates they want more people.

    IMPORTANT: Return startTime and endTime in the format YYYY-MM-DDTHH:mm:ss${utcOffset} — write the date and time exactly as the user would see it in their local timezone, then append the literal suffix "${utcOffset}". For example, if the event is Friday April 25 at 6 PM, return "2026-04-25T18:00:00${utcOffset}". Do not convert to UTC. Make sure the dates are in the future relative to the current date provided above.`,
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
