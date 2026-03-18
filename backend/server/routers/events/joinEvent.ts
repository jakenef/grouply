import { TRPCError } from "@trpc/server";
import z from "zod";
import calculateAge from "../../../../shared/utils/calculateAge";
import { paidProcedure } from "../../trpc";

const joinEvent = paidProcedure
  .input(
    z.object({
      eventId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const event = await ctx.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { registrations: true },
    });

    if (!event) {
      throw new TRPCError({ message: "Event not found", code: "NOT_FOUND" });
    }

    if (event.isCanceled) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot join a cancelled event",
      });
    }

    if (event.startsAt < new Date()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot join an event that has already started",
      });
    }

    const currentRegsCount = event.registrations.length;

    if (event.isFull || currentRegsCount + 1 > event.maxAttendees) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to join event because event is already full",
      });
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    const userAge = calculateAge(user?.birthday) ?? 18;
    if (
      (event.minAgeLimit && event.minAgeLimit > userAge) ||
      (event.maxAgeLimit && event.maxAgeLimit < userAge)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Failed to join event because user age is outside event age range",
      });
    }

    const existingReg = await ctx.prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId: ctx.user.id, eventId: input.eventId },
      },
    });

    if (existingReg) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are already registered for this event",
      });
    }

    const result = await ctx.prisma.$transaction(async (tx) => {
      // Re-check capacity inside transaction
      const eventCheck = await tx.event.findUnique({
        where: { id: input.eventId },
        include: { registrations: true },
      });

      const activeRegs = eventCheck!.registrations.length;

      if (activeRegs >= eventCheck!.maxAttendees) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is now full",
        });
      }

      // Create registration
      const registration = await tx.eventRegistration.create({
        data: { userId: ctx.user.id, eventId: input.eventId },
      });

      // Update isFull if we just filled the last spot
      if (activeRegs + 1 >= eventCheck!.maxAttendees) {
        await tx.event.update({
          where: { id: input.eventId },
          data: { isFull: true },
        });
      }

      return registration;
    });
  });

export default joinEvent;
