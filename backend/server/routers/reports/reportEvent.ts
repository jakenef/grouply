import { TRPCError } from "@trpc/server";
import z from "zod";
import { reportReasonEnum } from "../../schemas/validation";
import { paidProcedure } from "../../trpc";

export const reportEvent = paidProcedure
  .input(
    z.object({
      eventId: z.string(),
      reason: reportReasonEnum,
      description: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { eventId, reason, description } = input;
    const userId = ctx.user.id;

    // Check if event exists
    const event = await ctx.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
      });
    }

    // Create the report
    const report = await ctx.prisma.report.create({
      data: {
        eventId,
        reporterUserId: userId,
        reason,
        description,
      },
    });

    return report;
  });
