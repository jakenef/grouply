import z from "zod";
import { prisma } from "../../prisma";
import { paidProcedure } from "../../trpc";

export const getActivityById = paidProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const activity = await prisma.activity.findUnique({
      where: { id: input.id },
    });

    return activity;
  });
