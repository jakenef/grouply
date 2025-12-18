import { TRPCError } from "@trpc/server";
import z from "zod";
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

    const location = await prisma.location.upsert({
      where: {
        id: input.locationData.placeId,
      },
      update: {},
      create: {
        id: input.locationData.placeId,
        city: input.locationData.city || null,
        region: input.locationData.region || null,
        countryCode: input.locationData.countryCode || null,
        formatted: input.locationData.formatted,
        lat: input.locationData.lat,
        lng: input.locationData.lng,
        precision: "point",
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
      minAttendees: 2,
      maxAttendees: input.maxAttendees,
      eventUrl: "not_implemented.com",
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
