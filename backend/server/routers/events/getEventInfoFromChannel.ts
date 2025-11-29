import z from "zod";
import { prisma } from "../../prisma";
import { protectedProcedure } from "../../trpc";

export const getEventInfoFromChannel = protectedProcedure
  .input(
    z.object({
      channelId: z.string(),
    })
  )
  .output(
    z.object({
      name: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    // load in contextmessages
    const contextMessages = await prisma.chatMessage.findMany({
      where: {
        channelId: input.channelId,
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const instructions =
      "You are the Grouply app event concierge. You are in charge of generating the info for the event the user has described. Format your output in this way: ";

    // get activity
    // AI generate all text fields

    return { name: "name " };
  });
