import z from "zod";
import { eventSchema } from "../../schemas";
import { protectedProcedure } from "../../trpc";

export const getSuggestedEventsFromUser = protectedProcedure
  .output(z.array(eventSchema))
  .query(async ({ ctx, input }) => {
    return null;
  });
