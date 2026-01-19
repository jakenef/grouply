import { TRPCError } from "@trpc/server";
import filter from "leo-profanity";
import z from "zod";
import calculateAge from "../../../../shared/utils/calculateAge";
import { prisma } from "../../prisma";
import { locationDataSchema } from "../../schemas";
import { protectedProcedure } from "../../trpc";

export const upsertEvent = protectedProcedure
  .input(
    z.object({
      eventId: z.string().optional(),
      name: z.string().trim().min(0),
      description: z.string().trim().min(0),
      activityId: z.string().trim().min(0),
      startTime: z.coerce.date(),
      endTime: z.coerce.date(),
      locationData: locationDataSchema,
      imageUrls: z.array(z.string().trim().min(0)),
      coverImageUrl: z.string().trim().min(0),
      maxAttendees: z.number(),
      minAttendees: z.number(),
      minAge: z.number(),
      maxAge: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const organizerUser = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        interests: true,
        traitScores: {
          include: {
            trait: true,
          },
        },
      },
    });

    if (!organizerUser) {
      throw new TRPCError({
        message: "User Profile Not Found",
        code: "NOT_FOUND",
      });
    }

    // Check if the age range is valid for the creator
    const creatorAge = calculateAge(organizerUser.birthday);
    if (creatorAge !== null) {
      if (creatorAge < input.minAge || creatorAge > input.maxAge) {
        throw new TRPCError({
          message: `Your age (${creatorAge}) is outside the event's age range (${input.minAge}-${input.maxAge})`,
          code: "BAD_REQUEST",
        });
      }
    }

    // If updating an event, check all registered users
    if (input.eventId) {
      const registrations = await prisma.eventRegistration.findMany({
        where: {
          eventId: input.eventId,
        },
        include: {
          user: true,
        },
      });

      const usersOutsideRange: Array<{ name: string; age: number }> = [];

      for (const registration of registrations) {
        const userAge = calculateAge(registration.user.birthday);
        if (
          userAge !== null &&
          (userAge < input.minAge || userAge > input.maxAge)
        ) {
          usersOutsideRange.push({
            name: registration.user.givenName,
            age: userAge,
          });
        }
      }

      if (usersOutsideRange.length > 0) {
        const userList = usersOutsideRange
          .map((u) => `${u.name} (age ${u.age})`)
          .join(", ");
        throw new TRPCError({
          message: `Cannot update event: The following registered users are outside the age range (${input.minAge}-${input.maxAge}): ${userList}`,
          code: "BAD_REQUEST",
        });
      }
    }

    // Validate minAttendees and maxAttendees
    if (input.minAttendees <= 0) {
      throw new TRPCError({
        message: "Min attendees must be a positive number",
        code: "BAD_REQUEST",
      });
    }

    if (input.maxAttendees <= 0) {
      throw new TRPCError({
        message: "Max attendees must be a positive number",
        code: "BAD_REQUEST",
      });
    }

    if (input.minAttendees > input.maxAttendees) {
      throw new TRPCError({
        message: "Min attendees cannot be greater than max attendees",
        code: "BAD_REQUEST",
      });
    }

    // If updating an event, validate against current attendees
    if (input.eventId) {
      const currentRegistrations = await prisma.eventRegistration.count({
        where: {
          eventId: input.eventId,
        },
      });

      if (input.maxAttendees < currentRegistrations) {
        throw new TRPCError({
          message: `Max attendees (${input.maxAttendees}) cannot be less than current attendees (${currentRegistrations})`,
          code: "BAD_REQUEST",
        });
      }
    }

    // Validate start time is not in the past
    const now = new Date();
    if (input.startTime < now) {
      throw new TRPCError({
        message: "Event start time cannot be in the past",
        code: "BAD_REQUEST",
      });
    }

    // Validate end time is after start time
    if (input.endTime <= input.startTime) {
      throw new TRPCError({
        message: "Event end time must be after start time",
        code: "BAD_REQUEST",
      });
    }

    // Validate event name and description for profanity

    if (filter.check(input.name)) {
      throw new TRPCError({
        message: "Event name contains inappropriate language",
        code: "BAD_REQUEST",
      });
    }

    if (filter.check(input.description)) {
      throw new TRPCError({
        message: "Event description contains inappropriate language",
        code: "BAD_REQUEST",
      });
    }

    const location = await prisma.location.upsert({
      where: {
        id: input.locationData.placeId,
      },
      update: {
        city: input.locationData.city || null,
        region: input.locationData.region || null,
        countryCode: input.locationData.countryCode || null,
        formatted: input.locationData.formatted,
        lat: input.locationData.lat,
        lng: input.locationData.lng,
        precision: "POINT",
      },
      create: {
        id: input.locationData.placeId,
        city: input.locationData.city || null,
        region: input.locationData.region || null,
        countryCode: input.locationData.countryCode || null,
        formatted: input.locationData.formatted,
        lat: input.locationData.lat,
        lng: input.locationData.lng,
        precision: "POINT",
      },
    });

    const eventData = {
      name: input.name,
      desc: input.description,
      activity: { connect: { id: input.activityId } },
      organizer: { connect: { id: ctx.user.id } },
      startsAt: input.startTime,
      endsAt: input.endTime,
      location: { connect: { id: input.locationData.placeId } },
      imageUrls: input.imageUrls,
      coverImageUrl: input.coverImageUrl,
      minAttendees: input.minAttendees,
      maxAttendees: input.maxAttendees,
      eventUrl: "not_implemented.com",
      lowerAgeLimit: input.minAge,
      upperAgeLimit: input.maxAge,
    };

    if (input.eventId) {
      return prisma.event.update({
        where: { id: input.eventId },
        data: eventData,
      });
    } else {
      return prisma.$transaction(async (tx) => {
        const event = await prisma.event.create({
          data: {
            ...eventData,
            snapshot: {
              create: {
                hostUserId: ctx.user.id,
                hostGivenName: ctx.user.givenName,
                interestIds: organizerUser.interests.map(
                  (interest) => interest.interestId
                ),
                traitScores: organizerUser.traitScores.reduce((acc, ts) => {
                  acc[ts.trait.slug] = ts.score;
                  return acc;
                }, {} as Record<string, number>),
                capturedAt: new Date(),
              },
            },
          },
        });

        await tx.eventRegistration.create({
          data: {
            eventId: event.id,
            userId: ctx.user.id,
          },
        });

        return event;
      });
    }
  });
