import { getActivityFromDesc } from "../../activity/getActivityFromDesc";
import { getSuggestedEventsFromUser } from "../getSuggestedEventsFromUser/getSuggestedEventsFromUser";

export async function getSuggestedEventsFromActivityDesc({
  activityDescription,
  groupSize,
  startTimeString,
  endTimeString,
  userId,
}: {
  activityDescription: string;
  groupSize: number;
  startTimeString: string;
  endTimeString: string;
  userId: string;
}) {
  const startTime = startTimeString ? new Date(startTimeString) : undefined;
  const endTime = endTimeString ? new Date(endTimeString) : undefined;
  const events = await getSuggestedEventsFromUser(userId);
  const activity = await getActivityFromDesc(activityDescription);

  type Activity = Awaited<ReturnType<typeof getActivityFromDesc>>;
  type EventWithScore = Awaited<
    ReturnType<typeof getSuggestedEventsFromUser>
  >[number];

  // filter down events by activity, then by start/endtime and groupsize
  const matchesActivity = (
    eventWithScore: EventWithScore,
    activity: Activity
  ) => {
    if (!activity || !eventWithScore.event.activity) {
      return false;
    } else if (activity.id != eventWithScore.event.activityId) {
      return false;
    }
    return true;
  };

  const fitsTimeWindow = (
    eventWithScore: EventWithScore,
    windowStart: Date | undefined,
    windowEnd: Date | undefined
  ) => {
    return (
      eventWithScore.event.startsAt >= (windowStart ?? 0) &&
      eventWithScore.event.startsAt <= (windowEnd ?? Number.POSITIVE_INFINITY)
    );
  };

  const fitsGroupSize = (eventWithScore: EventWithScore, groupSize: number) => {
    const min = eventWithScore.event.minAttendees ?? 1;
    const max = eventWithScore.event.maxAttendees ?? Number.POSITIVE_INFINITY;
    return groupSize >= min && groupSize <= max;
  };

  const filteredEvents = events.filter(
    (event) =>
      matchesActivity(event, activity) &&
      fitsTimeWindow(event, startTime, endTime) &&
      fitsGroupSize(event, groupSize)
  );

  filteredEvents.sort((a, b) => {
    const aScore = a.score;
    const bScore = b.score;
    return bScore - aScore;
  });

  // return resulting events
  return filteredEvents;
}
