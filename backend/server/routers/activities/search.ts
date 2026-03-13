import z from "zod";
import { prisma } from "../../prisma";
import { paidProcedure } from "../../trpc";

export const searchActivities = paidProcedure
  .input(
    z.object({
      query: z.string(),
    }),
  )
  .query(async ({ input }) => {
    console.log("Searching activities with query:", input.query);

    const activities = await prisma.activity.findMany({
      where: {
        label: {
          contains: input.query,
          mode: "insensitive",
        },
      },
      take: 20,
      orderBy: {
        label: "asc",
      },
    });

    console.log("Found activities:", activities.length);
    console.log("Activities:", activities);

    return activities;
  });
