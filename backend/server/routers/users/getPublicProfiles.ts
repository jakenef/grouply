import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getPublicProfiles = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(20),
      locationId: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: {
        locationId: input.locationId,
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
      take: input.limit,
    });
  });
