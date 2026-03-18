import { TRPCError } from "@trpc/server";
import z from "zod";
import { paidProcedure } from "../../trpc";

const cancelEvent = paidProcedure
  .input(z.object({ eventId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // check if event exists
    const event = await ctx.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { registrations: true },
    });
    if (!event) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cannot find event" });
    }

    // check if user is host
    if (!event.organizerId || ctx.user.id != event.organizerId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not hosting this event",
      });
    }

    // cancel
    await ctx.prisma.event.update({
      where: { id: input.eventId },
      data: { isCanceled: true },
    });
  });
export default cancelEvent;
