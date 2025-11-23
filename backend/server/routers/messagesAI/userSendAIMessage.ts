import { ChatMessageRole } from "@/backend/generated/prisma/client";
import z from "zod";
import { prisma } from "../../prisma";
import { generateAIResponse } from "../../services/ai/generateAIResponse";
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
      id: z.string(),
      role: z.enum(ChatMessageRole),
      channelId: z.string(),
      authorId: z.string(),
      body: z.string(),
      createdAt: z.date(),
      editedAt: z.date().nullable(),
      deletedAt: z.date().nullable(),
      toolName: z.string().nullable(),
      toolArgs: z.any().nullable(),
      toolResult: z.any().nullable(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    let channel = undefined;
    if (input.channelId) {
      channel = await prisma.chatChannel.findFirst({
        where: {
          id: input.channelId,
          kind: "ai",
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

    const response = await generateAIResponse({
      channelId: channel.id,
      userId: ctx.user.id,
    });

    const chatMessageResponse = await prisma.chatMessage.create({
      data: {
        body: response.body,
        authorId: response.authorId,
        role: response.role as any,
        channelId: channel.id,
      },
    });

    return chatMessageResponse;
  });
