import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "../../trpc";

export const resolveReport = protectedProcedure
  .input(
    z.object({
      reportId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if user is admin
    if (ctx.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can resolve reports",
      });
    }

    const { reportId } = input;

    const report = await ctx.prisma.report.update({
      where: { id: reportId },
      data: { isResolved: true },
    });

    return report;
  });
