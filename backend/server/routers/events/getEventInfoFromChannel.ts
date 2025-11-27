import z from "zod";
import { eventSchema } from "../../schemas";
import { protectedProcedure } from "../../trpc";

export const getEventInfoFromChannel = protectedProcedure
  .input(
    z.object({
      channelId: z.string(),
    })
  )
  .output(
    z.object({
      eventSchema,
    })
  )
  .query(async ({ ctx, input }) => {
    return {};
  });
