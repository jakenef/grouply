import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const  = protectedProcedure
  .input(
    z.object({
      interests: z.array(z.string()),
      traits: z.array(z.string()),
      preferredGroupSizeMin: z.number().min(2),
      preferredGroupSizeMax: z.number().min(2),
      preferredAgeMin: z.number().min(18),
      preferredAgeMax: z.number().min(18),
      maxTravelDist: z.number().positive(),
      customInterests: z
        .array(
          z.object({
            label: z.string(),
            id: z.string(),
          })
        )
        .optional(),
      customTraits: z
        .array(
          z.object({
            label: z.string(),
            id: z.string(),
          })
        )
        .optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.prisma.$transaction(async (tx) => {
        const updatedProfile = await tx.user.update({
          where: {
            id: ctx.user.id,
          },
          data: {
            maxGroupSize: input.preferredGroupSizeMax,
            minGroupSize: input.preferredGroupSizeMin,
            maxAgePreference: input.preferredAgeMax,
            minAgePreference: input.preferredAgeMin,
            maxTravelKm: input.maxTravelDist,
          },
        });

        const customInterestIds: string[] = [];

        if (input.customInterests && input.customInterests.length > 0) {
          for (const customInterest of input.customInterests) {
            const slug = customInterest.label
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");

            const newInterest = await tx.interest.create({
              data: {
                label: customInterest.label.trim(),
                slug: `custom-${slug}-${Date.now()}`,
                isApproved: false,
              },
            });

            customInterestIds.push(newInterest.id);
          }
        }

        const customTraitIds: string[] = [];

        if (input.customTraits && input.customTraits.length > 0) {
          for (const customTrait of input.customTraits) {
            const slug = customTrait.label
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");

            const newTrait = await tx.trait.create({
              data: {
                label: customTrait.label.trim(),
                slug: `custom-${slug}-${Date.now()}`,
                isApproved: false,
              },
            });

            customTraitIds.push(newTrait.id);
          }
        }

        await tx.userInterest.deleteMany({
          where: { userId: ctx.user.id },
        });

        const allInterestIds = [
          ...input.interests.filter((id) => !id.startsWith("custom-")),
          ...customInterestIds,
        ];

        if (allInterestIds.length > 0) {
          await tx.userInterest.createMany({
            data: allInterestIds.map((interestId) => ({
              userId: ctx.user.id,
              interestId,
              weight: 1,
            })),
          });
        }

        await tx.userTraitScore.deleteMany({
          where: { userId: ctx.user.id },
        });

        const allTraitIds = [
          ...input.traits.filter((id) => !id.startsWith("custom-")),
          ...customTraitIds,
        ];

        if (allTraitIds.length > 0) {
          await tx.userTraitScore.createMany({
            data: allTraitIds.map((traitId) => ({
              userId: ctx.user.id,
              traitId,
              score: 1,
            })),
          });
        }

        return {
          profile: updatedProfile,
          interestsCount: input.interests.length,
          traitsCount: input.traits.length,
        };
      });

      return result;
    } catch (error) {
      console.error("Error saving user preferences:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to save preferences. Please try again.",
        cause: error,
      });
    }
  });
