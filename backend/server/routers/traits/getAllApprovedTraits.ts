import { publicProcedure } from "../../trpc";

export const getAllApprovedTraits = publicProcedure.query(async ({ ctx }) => {
  return ctx.prisma.trait.findMany({
    where: { isApproved: true },
    orderBy: { label: "asc" },
    select: {
      id: true,
      label: true,
      slug: true,
      desc: true,
    },
  });
});
