import { TRPCError } from "@trpc/server";
import z from "zod";
import { prisma } from "../../prisma";
import { getActivitiesFromDesc } from "../../services/activity/getActivityFromDesc";
import { generateEventFieldsFromContext } from "../../services/ai/generateEventFieldsFromContext";
import { paidProcedure } from "../../trpc";

export const generateEventFromChannel = paidProcedure
  .input(
    z.object({
      channelId: z.string(),
    }),
  )
  .output(
    z.object({
      name: z.string(),
      description: z.string(),
      startTime: z.date(),
      endTime: z.date(),
      maxAttendees: z.number(),
      minAttendees: z.number(),
      minAge: z.number(),
      maxAge: z.number(),
      activityId: z.string().nullable(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const messages = await prisma.chatMessage.findMany({
      where: { channelId: input.channelId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    const birthday = user?.birthday;
    if (!birthday) throw new Error("No birthday found for user");

    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();

    const minAge = Math.max(age - 2, 0);
    const maxAge = age + 2;

    if (!messages || messages.length == 0) {
      throw new TRPCError({
        message: "Channel or messages not found",
        code: "NOT_FOUND",
      });
    }

    const eventDetails = await generateEventFieldsFromContext({ messages });

    const activity =
      (await getActivitiesFromDesc(eventDetails.description))[0] ?? null;

    return {
      ...eventDetails,
      maxAge,
      minAge,
      activityId: activity?.id ?? null,
    };
  });
