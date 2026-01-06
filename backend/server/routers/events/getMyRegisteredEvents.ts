import { protectedProcedure } from "../../trpc";

export const getMyRegisteredEvents = protectedProcedure.query(
  async ({ ctx }) => {
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
  }
);
