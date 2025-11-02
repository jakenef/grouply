import z from "zod";
import { prisma } from "../../prisma";
import { protectedProcedure } from "../../trpc";

export const userSendAIMessage = protectedProcedure
  .input(
    z.object({
      channelId: z.string().optional(),
      text: z.string().trim().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    let channel = undefined;
    if (input.channelId) {
      channel = await prisma.chatChannel.findUnique({
        where: {
          id: input.channelId,
          members: {
            some: {
              userId: ctx.user.id,
            },
          },
        },
      });
    }

    if (!channel) {
      channel = await prisma.chatChannel.create({
        data: { kind: "ai", members: { create: { userId: ctx.user.id } } },
      });
    }

    const newMessage = await prisma.chatMessage;
  });
