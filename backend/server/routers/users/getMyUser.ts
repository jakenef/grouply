import { protectedProcedure } from "../../trpc";

export const getMyUser = protectedProcedure.query(async ({ ctx }) => {
  return ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    include: {
      location: true,
      interests: {
        where: { interest: { isApproved: true } },
        include: { interest: true },
      },
      traitScores: {
        where: { trait: { isApproved: true } },
        include: { trait: true },
      },
    },
  });
});
