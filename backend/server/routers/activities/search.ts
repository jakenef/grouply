import z from "zod";
import { prisma } from "../../prisma";
import { publicProcedure } from "../../trpc";

export const searchActivities = publicProcedure
  .input(
    z.object({
      query: z.string(),
    })
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
