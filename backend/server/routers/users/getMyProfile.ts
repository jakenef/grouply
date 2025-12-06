import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getMyProfile = protectedProcedure
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
        avatarUrl: true,
        role: true,
        location: true,
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });
  });
