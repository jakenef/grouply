import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { ONBOARDING_TRAIT_MAPPINGS } from "../../utils/questionMapping/onboardingTraitMap";

export const saveUserPreferences = protectedProcedure
  .input(
    z.object({
      interests: z.array(z.string()),
      traits: z.array(z.string()),
      preferredGroupSizeMin: z.number().min(2),
      preferredGroupSizeMax: z.number().min(2),
      preferredAgeMin: z.number().min(18),
      preferredAgeMax: z.number().min(18),
      maxTravelDist: z.number().positive(),
      personalityAnswers: z
        .object({
          eventEnergy: z.array(z.string()).optional(),
          groupRole: z.string().optional(),
          preferredAtmosphere: z.string().optional(),
          downtimePreference: z.string().optional(),
          peopleVibe: z.string().optional(),
        })
        .optional(),
      customInterests: z
        .array(
          z.object({
            label: z.string(),
            id: z.string(),
          }),
        )
        .optional(),
      customTraits: z
        .array(
          z.object({
            label: z.string(),
            id: z.string(),
          }),
        )
        .optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    if (input.preferredGroupSizeMax < input.preferredGroupSizeMin) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Preferred group size max is smaller than preferred group size min",
      });
    }
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

        // Build trait scores from personality answers
        const traitScoresBySlug: Record<string, number> = {};

        if (input.personalityAnswers) {
          // Flatten all answers (some may be arrays, some strings)
          const answers: string[] = [];
          for (const value of Object.values(input.personalityAnswers)) {
            if (Array.isArray(value)) {
              answers.push(...value);
            } else if (value) {
              answers.push(value);
            }
          }

          for (const answerKey of answers) {
            const traitMapping = ONBOARDING_TRAIT_MAPPINGS[answerKey];
            if (traitMapping) {
              for (const [traitSlug, weight] of Object.entries(traitMapping)) {
                traitScoresBySlug[traitSlug] =
                  (traitScoresBySlug[traitSlug] || 0) + weight;
              }
            }
          }
        }

        // Look up trait IDs by slug
        const traitSlugs = Object.keys(traitScoresBySlug);
        const traitsFromPersonality =
          traitSlugs.length > 0
            ? await tx.trait.findMany({
                where: { slug: { in: traitSlugs } },
                select: { id: true, slug: true },
              })
            : [];

        // Create map of slug -> id
        const slugToId = new Map(
          traitsFromPersonality.map((t) => [t.slug, t.id]),
        );

        // Combine manually selected traits with personality-derived traits
        const allTraitIds = [
          ...input.traits.filter((id) => !id.startsWith("custom-")),
          ...customTraitIds,
        ];

        // Build final trait scores: manually selected get score 1, personality-derived use accumulated weights
        const traitScoreData: { userId: string; traitId: string; score: number }[] =
          [];

        // Add manually selected traits with score 1
        for (const traitId of allTraitIds) {
          traitScoreData.push({
            userId: ctx.user.id,
            traitId,
            score: 1,
          });
        }

        // Add personality-derived traits with accumulated scores
        for (const [slug, score] of Object.entries(traitScoresBySlug)) {
          const traitId = slugToId.get(slug);
          if (traitId && !allTraitIds.includes(traitId)) {
            traitScoreData.push({
              userId: ctx.user.id,
              traitId,
              score,
            });
          }
        }

        if (traitScoreData.length > 0) {
          await tx.userTraitScore.createMany({
            data: traitScoreData,
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
