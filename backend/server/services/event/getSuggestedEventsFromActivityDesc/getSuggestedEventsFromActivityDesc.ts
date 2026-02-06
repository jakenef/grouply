import { getActivitiesFromDesc } from "../../activity/getActivityFromDesc";
import { getSuggestedEventsFromUser } from "../getSuggestedEventsFromUser/getSuggestedEventsFromUser";

type EventWithScore = Awaited<
  ReturnType<typeof getSuggestedEventsFromUser>
>[number];
// TODO: fix the fact that it only uses top 10 events anywhere for ai search
/**
 * Retrieves a list of suggested events based on the provided activity description, group size, time window, and user ID.
 *
 * This function performs the following steps:
 * 1. Parses the start and end time strings into Date objects.
 * 2. Fetches suggested events for the user.
 * 3. Determines the activity from the given description.
 * 4. Filters events to match the activity, fit within the specified time window, and accommodate the group size.
 * 5. Sorts the filtered events by their score in descending order.
 *
 * @param params - An object containing the following properties:
 * @param params.activityDescription - The description of the activity to match events against.
 * @param params.groupSize - The number of attendees for the event.
 * @param params.startTimeString - The start time of the desired event window (ISO string).
 * @param params.endTimeString - The end time of the desired event window (ISO string).
 * @param params.userId - The ID of the user for whom to suggest events.
 *
 * @returns A promise that resolves to an array of filtered and sorted event suggestions.
 */
export async function getSuggestedEventsFromActivityDesc({
  activityDescription,
  groupSize,
  startTimeString,
  endTimeString,
  userId,
}: {
  activityDescription: string;
  groupSize: number | null;
  startTimeString: string | null;
  endTimeString: string | null;
  userId: string;
}) {
  const startTime = startTimeString ? new Date(startTimeString) : undefined;
  const endTime = endTimeString ? new Date(endTimeString) : undefined;
  const events = await getSuggestedEventsFromUser(userId);
  const activities = await getActivitiesFromDesc(activityDescription);

  type Activities = Awaited<ReturnType<typeof getActivitiesFromDesc>>;

  // Filtering logic extracted to helper
  return filterAndSortEvents(
    events,
    activities,
    groupSize ?? undefined,
    startTime,
    endTime,
  );
}

/**
 * Filters and sorts events by activity, time window, and group size.
 * Returns events sorted by score descending.
 */
export function filterAndSortEvents(
  events: EventWithScore[],
  activities: Awaited<ReturnType<typeof getActivitiesFromDesc>>,
  groupSize?: number,
  startTime?: Date,
  endTime?: Date,
): EventWithScore[] {
  const matchesActivity = (
    eventWithScore: EventWithScore,
    activities: Awaited<ReturnType<typeof getActivitiesFromDesc>>,
  ) => {
    if (!activities.length || !eventWithScore.event.activity) {
      return false;
    }
    return activities.some(
      (activity) => activity.id === eventWithScore.event.activityId,
    );
  };

  const fitsTimeWindow = (
    eventWithScore: EventWithScore,
    windowStart: Date | undefined,
    windowEnd: Date | undefined,
  ) => {
    return (
      eventWithScore.event.startsAt >= (windowStart ?? 0) &&
      eventWithScore.event.startsAt <= (windowEnd ?? Number.POSITIVE_INFINITY)
    );
  };

  const fitsGroupSize = (
    eventWithScore: EventWithScore,
    groupSize?: number,
  ) => {
    if (!groupSize) return true;
    const min = eventWithScore.event.minAttendees ?? 1;
    const max = eventWithScore.event.maxAttendees ?? Number.POSITIVE_INFINITY;
    return groupSize >= min && groupSize <= max;
  };

  const filteredEvents = events.filter(
    (event) =>
      matchesActivity(event, activities) &&
      fitsTimeWindow(event, startTime, endTime) &&
      fitsGroupSize(event, groupSize),
  );

  filteredEvents.sort((a, b) => {
    const aScore = a.score;
    const bScore = b.score;
    return bScore - aScore;
  });

  // return resulting events
  return filteredEvents;
}
