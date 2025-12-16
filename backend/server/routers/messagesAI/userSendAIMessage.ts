import { ChatMessageRole } from "@/backend/generated/prisma/client";
import z from "zod";
import { prisma } from "../../prisma";
import { scoredEventSchema } from "../../schemas";
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
      refreshedEvents: z.array(scoredEventSchema).optional(),
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

    const { aiChatMessageResponse, latestRefresh } = await generateAIResponse({
      channelId: channel.id,
      userId: ctx.user.id,
    });

    // Ensure AI assistant location exists
    const aiLocation = await prisma.location.upsert({
      where: { id: "ai-location" },
      update: {},
      create: {
        id: "ai-location",
        city: "AI City",
        countryCode: "AI",
        precision: "city",
      },
    });

    // Ensure AI assistant user exists
    await prisma.user.upsert({
      where: { id: "ai-assistant" },
      update: {},
      create: {
        id: "ai-assistant",
        authUserId: "ai-assistant",
        email: "ai-assistant@grouply.app",
        givenName: "AI Assistant",
        locationId: aiLocation.id,
      },
    });

    const chatMessageResponse = await prisma.chatMessage.create({
      data: {
        body: aiChatMessageResponse.body,
        authorId: aiChatMessageResponse.authorId,
        role: aiChatMessageResponse.role as any,
        channelId: channel.id,
      },
    });

    const fixedRefresh = latestRefresh?.map(({ event, score }) => ({
      event: {
        ...event,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
        createdAt: new Date(event.createdAt),
        currentAttendees: event.regs ? event.regs.length : 0,
      },
      score,
    }));

    if (fixedRefresh) {
      console.log("refreshed with: ", fixedRefresh);
    }

    return { ...chatMessageResponse, refreshedEvents: fixedRefresh ?? [] };
  });
