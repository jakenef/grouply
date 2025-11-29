import z from "zod";
import { prisma } from "../../prisma";
import { protectedProcedure } from "../../trpc";

export const getEventDetailsFromId = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    z
      .object({
        name: z.string(),
        description: z.string(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const event = await prisma.event.findUnique({ where: { id: input.id } });
    if (event) {
      return { name: event.name, description: event.desc ?? "" };
    } else {
      return undefined;
    }
  });
