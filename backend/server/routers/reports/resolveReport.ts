import z from "zod";
import { adminProcedure } from "../../trpc";

export const resolveReport = adminProcedure
  .input(
    z.object({
      reportId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { reportId } = input;

    const report = await ctx.prisma.report.update({
      where: { id: reportId },
      data: { isResolved: true },
    });

    return report;
  });
