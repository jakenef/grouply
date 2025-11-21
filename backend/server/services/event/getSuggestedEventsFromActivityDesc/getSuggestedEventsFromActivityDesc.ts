import { getActivityFromDesc } from "../../activity/getActivityFromDesc";
import { getSuggestedEventsFromUser } from "../getSuggestedEventsFromUser/getSuggestedEventsFromUser";

export async function getSuggestedEventsFromActivityDesc(
  activityDescription: string,
  groupSize: number,
  startTime: Date,
  endTime: Date,
  userId: string
) {
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
    windowStart: Date,
    windowEnd: Date
  ) => {
    return (
      eventWithScore.event.startsAt >= windowStart &&
      eventWithScore.event.startsAt <= windowEnd
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
