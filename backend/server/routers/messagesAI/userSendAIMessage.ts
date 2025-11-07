import z from "zod";
import { prisma } from "../../prisma";
import { generateAIResponse } from "../../services/generateAIResponse";
import { protectedProcedure } from "../../trpc";

export const userSendAIMessage = protectedProcedure
  .input(
    z.object({
      channelId: z.string().optional(),
      text: z.string().trim().min(1),
    })
  )
  .output(
    z.object({
      response: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    let channel = undefined;
    if (input.channelId) {
      channel = await prisma.chatChannel.findFirst({
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

    const newMessage = await prisma.chatMessage.create({
      data: {
        body: input.text,
        channelId: channel.id,
        role: "user",
        authorId: ctx.user.id,
      },
    });

    const response = await generateAIResponse({ channelId: channel.id });

    return { response: response };
  });
