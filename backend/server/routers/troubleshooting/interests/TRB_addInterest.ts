import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const TRB_addInterest = adminProcedure
  .input(
    z.object({
      slug: z.string(),
      label: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const interest = await ctx.prisma.interest.create({
        data: { slug: input.slug, label: input.label, isApproved: true },
      });
      return interest;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create interest",
        cause: error,
      });
    }
  });
