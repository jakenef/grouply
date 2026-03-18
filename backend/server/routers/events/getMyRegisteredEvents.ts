import { paidProcedure } from "../../trpc";

export const getMyRegisteredEvents = paidProcedure.query(async ({ ctx }) => {
  const events = await ctx.prisma.event.findMany({
    where: {
      registrations: {
        some: {
          userId: ctx.user.id,
        },
      },
    },
    include: {
      registrations: true,
      location: { select: { formatted: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return events;
});
