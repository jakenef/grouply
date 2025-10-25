import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const updateMyProfile = protectedProcedure
  .input(
    z.object({
      displayName: z.string().min(2).max(50).optional(),
      avatarUrl: z.string().url().optional(),
      locationId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: input,
    });
  });
