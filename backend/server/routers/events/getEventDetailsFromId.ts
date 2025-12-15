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
        startTime: z.date(),
        endTime: z.date(),
        locationString: z.string(),
        numRegistered: z.number(),
        maxAttendees: z.number(),
        minAge: z.number(),
        maxAge: z.number(),
        attendeeIds: z.array(z.string()),
        imageUrls: z.array(z.string()),
        coverImageUrl: z.string(),
        hostId: z.string(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const event = await prisma.event.findUnique({
      where: { id: input.id },
      include: { regs: true, location: true },
    });

    if (event) {
      const numRegs = event.regs.length;
      const attendeeIds = event.regs.map((registration) => registration.userId);
      return {
        id: event.id,
        name: event.name,
        description: event.desc ?? "",
        startTime: event.startsAt,
        endTime: event.endsAt,
        locationString: event.location.formatted ?? "",
        numRegistered: numRegs,
        maxAttendees: event.maxAttendees ?? 0,
        minAge: event.lowerAgeLimit ?? 0,
        maxAge: event.upperAgeLimit ?? 0,
        attendeeIds: attendeeIds,
        imageUrls: event.imageUrls,
        coverImageUrl: event.coverImageUrl,
        hostId: event.organizerId,
      };
    } else {
      return undefined;
    }
  });
