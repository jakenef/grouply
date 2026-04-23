import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const TRB_addTrait = adminProcedure
  .input(
    z.object({
      slug: z.string(),
      label: z.string(),
      desc: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const trait = await ctx.prisma.trait.create({
        data: { slug: input.slug, label: input.label, desc: input.desc, isApproved: true },
      });
      return trait;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create trait",
        cause: error,
      });
    }
  });
