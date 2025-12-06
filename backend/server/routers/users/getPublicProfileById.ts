import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getPublicProfileById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        joinedAt: true,
        location: {
          select: {
            city: true,
            region: true,
          },
        },
      },
    });
  });
