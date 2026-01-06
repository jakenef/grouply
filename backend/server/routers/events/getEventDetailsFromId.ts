import z from "zod";
import { prisma } from "../../prisma";
import { protectedProcedure } from "../../trpc";

export const getEventDetailsFromId = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        activityId: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        locationString: z.string(),
        locationId: z.string(),
        lat: z.number().nullable(),
        lng: z.number().nullable(),
        numRegistered: z.number(),
        maxAttendees: z.number(),
        minAttendees: z.number(),
        minAge: z.number(),
        maxAge: z.number(),
        attendeeIds: z.array(z.string()),
        imageUrls: z.array(z.string()),
        coverImageUrl: z.string(),
        hostId: z.string(),
        isCanceled: z.boolean(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const event = await prisma.event.findUnique({
      where: { id: input.id },
      include: { registrations: true, location: true },
    });

    if (event) {
      const numRegs = event.registrations.length;
      const attendeeIds = event.registrations.map(
        (registration) => registration.userId
      );
      return {
        id: event.id,
        name: event.name,
        description: event.desc ?? "",
        activityId: event.activityId,
        startTime: event.startsAt,
        endTime: event.endsAt,
        locationString: event.location.formatted ?? "",
        locationId: event.locationId,
        lat: event.location.lat,
        lng: event.location.lng,
        numRegistered: numRegs,
        maxAttendees: event.maxAttendees ?? 0,
        minAttendees: event.minAttendees ?? 1,
        minAge: event.minAgeLimit ?? 0,
        maxAge: event.maxAgeLimit ?? 0,
        attendeeIds: attendeeIds,
        imageUrls: event.imageUrls,
        coverImageUrl: event.coverImageUrl,
        hostId: event.organizerId,
        isCanceled: event.isCanceled,
      };
    } else {
      return undefined;
    }
  });
