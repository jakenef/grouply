import z from "zod";
import { prisma } from "../../prisma";
import { publicProcedure } from "../../trpc";

export const getActivityById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const activity = await prisma.activity.findUnique({
      where: { id: input.id },
    });

    return activity;
  });
