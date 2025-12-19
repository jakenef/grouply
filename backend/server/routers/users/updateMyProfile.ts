import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const updateMyUserAndProfile = protectedProcedure
  .input(
    z.object({
      avatarUrl: z.string().optional(),
      locationId: z.string().optional(),
      bio: z.string().optional(),
      interestIds: z.array(z.string()).min(3).optional(),
      traitIds: z.array(z.string()).min(3).optional(),
      preferredGroupSizeMin: z.number().optional(),
      preferredGroupSizeMax: z.number().optional(),
      maxTravelKm: z.number().optional(),
      minAgePref: z.number().optional(),
      maxAgePref: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const result = ctx.prisma.$transaction(async (tx) => {
        const updatedProfile = await tx.userProfile.update({
          where: { userId: ctx.user.id },
          data: {
            bio: input.bio,
            preferredGroupSizeMax: input.preferredGroupSizeMax,
            preferredGroupSizeMin: input.preferredGroupSizeMin,
            maxTravelKm: input.maxTravelKm,
            maxAgePref: input.maxAgePref,
            minAgePref: input.minAgePref,
          },
        });

        await tx.userInterest.deleteMany({
          where: { userId: ctx.user.id },
        });

        if (input.interestIds && input.interestIds?.length > 0) {
          await tx.userInterest.createMany({
            data: input.interestIds.map((interestId) => ({
              userId: ctx.user.id,
              interestId,
              weight: 1,
            })),
          });
        }

        await tx.userTraitScore.deleteMany({
          where: { userId: ctx.user.id },
        });

        if (input.traitIds && input.traitIds?.length > 0) {
          await tx.userTraitScore.createMany({
            data: input.traitIds.map((traitId) => ({
              userId: ctx.user.id,
              traitId,
              score: 1,
            })),
          });
        }

        const updatedUser = await tx.user.update({
          where: { id: ctx.user.id },
          data: {
            locationId: input.locationId,
            avatarUrl: input.avatarUrl,
          },
        });
        return;
      });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user profile. Please try again.",
        cause: error,
      });
    }
  });
