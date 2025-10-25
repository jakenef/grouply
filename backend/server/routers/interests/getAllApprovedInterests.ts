import { publicProcedure } from "../../trpc";

export const getAllApprovedInterests = publicProcedure.query(
  async ({ ctx }) => {
    return ctx.prisma.interest.findMany({
      where: { isApproved: true },
      orderBy: { label: "asc" },
      select: {
        id: true,
        label: true,
        slug: true,
      },
    });
  }
);
