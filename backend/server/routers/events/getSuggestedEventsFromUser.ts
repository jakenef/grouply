import z from "zod";
import { scoredEventSchema } from "../../schemas";
import { getSuggestedEventsFromUser as getSuggestedEventsService } from "../../services/event/getSuggestedEventsFromUser/getSuggestedEventsFromUser";
import { protectedProcedure } from "../../trpc";

export const getSuggestedEventsFromUser = protectedProcedure
  .output(z.array(scoredEventSchema))
  .query(async ({ ctx, input }) => {
    const events = await getSuggestedEventsService(ctx.user.id);
    const dtoEvents = events.map(mapScoredEventToDTO);
    function mapScoredEventToDTO(scoredEvent: any) {
      return {
        event: {
          id: scoredEvent.event.id,
          name: scoredEvent.event.name,
          desc: scoredEvent.event.desc,
          startsAt: scoredEvent.event.startsAt,
          endsAt: scoredEvent.event.endsAt,
          isCancelled: scoredEvent.event.isCancelled,
          upperAgeLimit: scoredEvent.event.upperAgeLimit,
          lowerAgeLimit: scoredEvent.event.lowerAgeLimit,
          eventUrl: scoredEvent.event.eventUrl,
          imageUrls: scoredEvent.event.imageUrls,
          organizer: {
            id: scoredEvent.event.organizer.id,
            givenName: scoredEvent.event.organizer.givenName,
            avatarUrl: scoredEvent.event.organizer.avatarUrl,
          },
          activity: {
            id: scoredEvent.event.activity.id,
            slug: scoredEvent.event.activity.slug,
            label: scoredEvent.event.activity.label,
          },
          location: {
            id: scoredEvent.event.location.id,
            formatted: scoredEvent.event.location.formatted,
            city: scoredEvent.event.location.city,
            region: scoredEvent.event.location.region,
            countryCode: scoredEvent.event.location.countryCode,
            lat: scoredEvent.event.location.lat,
            lng: scoredEvent.event.location.lng,
          },
          maxAttendees: scoredEvent.event.maxAttendees,
          currentAttendees: scoredEvent.event.regs?.length ?? 0,
          isFull: scoredEvent.event.isFull,
          snapshot: scoredEvent.event.snapshot
            ? {
                hostUserId: scoredEvent.event.snapshot.hostUserId,
                hostGivenName: scoredEvent.event.snapshot.hostGivenName,
                interestIds: scoredEvent.event.snapshot.interestIds,
                traitScores: scoredEvent.event.snapshot.traitScores as Record<
                  string,
                  number
                > | null,
              }
            : null,
          createdAt: scoredEvent.event.createdAt,
        },
        score: scoredEvent.score,
      };
    }

    return dtoEvents;
  });
