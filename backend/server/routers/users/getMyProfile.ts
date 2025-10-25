import { protectedProcedure } from "../../trpc";

export const getMyProfile = protectedProcedure.query(async ({ ctx }) => {
  return ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
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
