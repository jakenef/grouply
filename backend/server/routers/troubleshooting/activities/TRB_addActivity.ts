import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { openai } from "../../../openai";

export const TRB_addActivity = adminProcedure
  .input(
    z.object({
      slug: z.string(),
      label: z.string(),
      description: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const activity = await ctx.prisma.activity.create({
        data: { slug: input.slug, label: input.label, description: input.description },
      });

      const embResp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: input.description,
        encoding_format: "float",
      });
      const embedding = embResp.data[0].embedding;

      await ctx.prisma.$executeRawUnsafe(
        `UPDATE "Activity" SET embedding = $1::vector WHERE id = $2`,
        JSON.stringify(embedding),
        activity.id
      );

      return activity;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create activity",
        cause: error,
      });
    }
  });
