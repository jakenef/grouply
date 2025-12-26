import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "../../trpc";

const leaveEvent = protectedProcedure
  .input(z.object({ eventId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // check if event exists
    const event = await ctx.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { regs: true },
    });
    if (!event) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cannot find event" });
    }

    // check if user is registered
    const regUserIds = event.regs.map((reg) => reg.userId);
    const isUserRegistered = regUserIds.includes(ctx.user.id);
    if (!isUserRegistered) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is not registered to this event",
      });
    }

    // check if user is host
    if (ctx.user.id == event.organizerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Host cannot leave their event",
      });
    }

    // then they can leave, delete their reg
    await ctx.prisma.$transaction(async (tx) => {
      const updatedEvent = await tx.event.update({
        where: { id: input.eventId },
        data: { regs: { deleteMany: { userId: ctx.user.id } } },
        include: { regs: true },
      });

      const regCount = updatedEvent.regs.length;
      if (updatedEvent.maxAttendees > regCount) {
        await tx.event.update({
          where: { id: input.eventId },
          data: { isFull: false },
        });
      }
    });
  });

export default leaveEvent;
