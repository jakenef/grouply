import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getMyUser = protectedProcedure
  .input(
    z.object({
      authId: z.string(),
    })
  )
  .query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        givenName: true,
        familyName: true,
        avatarUrl: true,
        role: true,
        joinedAt: true,
        location: true,
        interests: {
          where: {
            interest: {
              isApproved: true,
            },
          },
          include: {
            interest: true,
          },
        },
        traitScores: {
          where: {
            trait: {
              isApproved: true,
            },
          },
          include: {
            trait: true,
          },
        },
      },
    });
  });
