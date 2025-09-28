import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
  // Public - anyone can see basic user profiles (for testing)
  getPublicProfiles: publicProcedure
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
    }),
  // Protected - user can get their own full profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        location: true,
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });
  }),

  // Protected - user can update their own profile
  updateMyProfile: protectedProcedure
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
    }),
});
