import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { genderEnum, locationDataSchema } from "../schemas";
import {
  authProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../trpc";

export const usersRouter = router({
  // Check if the authenticated user exists in the database
  checkUserExists: authProcedure.query(async ({ ctx }) => {
    if (!ctx.supabaseUser) {
      return { exists: false };
    }

    const user = await ctx.prisma.user.findFirst({
      where: { authUserId: ctx.supabaseUser.id },
    });

    return { exists: !!user };
  }),

  getAllApprovedInterests: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.interest.findMany({
      where: { isApproved: true },
      orderBy: { label: "asc" },
      select: {
        id: true,
        label: true,
        slug: true,
      },
    });
  }),

  getAllApprovedTraits: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.trait.findMany({
      where: { isApproved: true },
      orderBy: { label: "asc" },
      select: {
        id: true,
        label: true,
        slug: true,
        desc: true,
      },
    });
  }),

  createUserAndUserProfile: authProcedure
    .input(
      z.object({
        displayName: z.string().trim().min(1),
        birthday: z.coerce.date(), // Use coerce to convert string dates to Date objects
        gender: genderEnum,
        location: locationDataSchema,
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure we have the Supabase user
      if (!ctx.supabaseUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      // Check if user already exists
      if (
        await ctx.prisma.user.findFirst({
          where: { authUserId: ctx.supabaseUser.id },
        })
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this ID already exists",
        });
      }

      // Create or find location record
      let locationId: string | undefined = undefined;
      if (input.location) {
        // Check if location already exists with this placeId
        const existingLocation = await ctx.prisma.location.findUnique({
          where: { id: input.location.placeId },
        });

        if (existingLocation) {
          locationId = existingLocation.id;
        } else {
          // Create new location
          const newLocation = await ctx.prisma.location.create({
            data: {
              id: input.location.placeId,
              city: input.location.city || null,
              region: input.location.region || null,
              countryCode: input.location.countryCode || null,
              formatted: input.location.formatted,
              lat: input.location.lat,
              lng: input.location.lng,
              precision: "city", // For user locations, we use city-level precision
            },
          });
          locationId = newLocation.id;
        }
      }

      try {
        // Use a transaction to ensure atomic operations
        const result = await ctx.prisma.$transaction(async (tx) => {
          // Create user record
          const user = await tx.user.create({
            data: {
              authUserId: ctx.supabaseUser.id,
              email: ctx.supabaseUser.email || "",
              displayName: input.displayName,
              locationId: locationId,
              avatarUrl: input.avatarUrl,
            },
          });

          // Create user profile
          const profile = await tx.userProfile.create({
            data: {
              userId: user.id,
              birthday: input.birthday,
              gender: input.gender,
              bio: input.bio,
            },
          });

          return { user, profile };
        });

        // Return the newly created user with profile
        return result;
      } catch (error) {
        console.error("Error creating user and profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user profile. Please try again.",
          cause: error,
        });
      }
    }),

  saveUserAndUserProfilePreferences: protectedProcedure
    .input(
      z.object({
        interests: z.array(z.string()), // Array of interest IDs or custom labels (prefixed with "custom-")
        traits: z.array(z.string()), // Array of trait IDs or custom labels (prefixed with "custom-")
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
          // 1. Update UserProfile with preferences
          const updatedProfile = await tx.userProfile.update({
            where: {
              userId: ctx.user.id,
            },
            data: {
              preferredGroupSizeMax: input.preferredGroupSizeMax,
              preferredGroupSizeMin: input.preferredGroupSizeMin,
              maxAgePref: input.preferredAgeMax,
              minAgePref: input.preferredAgeMin,
              maxTravelKm: input.maxTravelDist,
            },
          });

          // 2. Process custom interests first
          const customInterestIds: string[] = [];

          if (input.customInterests && input.customInterests.length > 0) {
            for (const customInterest of input.customInterests) {
              // Create slug from label (normalize to lowercase, replace spaces with hyphens)
              const slug = customInterest.label
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

              // Create the custom interest (not approved by default)
              const newInterest = await tx.interest.create({
                data: {
                  label: customInterest.label.trim(),
                  slug: `custom-${slug}-${Date.now()}`, // Ensure uniqueness
                  isApproved: false, // User-created interests need approval
                },
              });

              customInterestIds.push(newInterest.id);
            }
          }

          // 3. Process custom traits
          const customTraitIds: string[] = [];

          if (input.customTraits && input.customTraits.length > 0) {
            for (const customTrait of input.customTraits) {
              // Create slug from label (normalize to lowercase, replace spaces with hyphens)
              const slug = customTrait.label
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

              // Create the custom trait (not approved by default)
              const newTrait = await tx.trait.create({
                data: {
                  label: customTrait.label.trim(),
                  slug: `custom-${slug}-${Date.now()}`, // Ensure uniqueness
                  isApproved: false, // User-created traits need approval
                },
              });

              customTraitIds.push(newTrait.id);
            }
          }

          // 4. Delete existing interests and re-create them
          await tx.userInterest.deleteMany({
            where: { userId: ctx.user.id },
          });

          // Combine standard interests with custom ones
          const allInterestIds = [
            ...input.interests.filter((id) => !id.startsWith("custom-")),
            ...customInterestIds,
          ];

          // Create new interests connections
          if (allInterestIds.length > 0) {
            await tx.userInterest.createMany({
              data: allInterestIds.map((interestId) => ({
                userId: ctx.user.id,
                interestId,
                weight: 1, // Default weight for MVP
              })),
            });
          }

          // 5. Delete existing trait scores and re-create them
          await tx.userTraitScore.deleteMany({
            where: { userId: ctx.user.id },
          });

          // Combine standard traits with custom ones
          const allTraitIds = [
            ...input.traits.filter((id) => !id.startsWith("custom-")),
            ...customTraitIds,
          ];

          // Create new trait scores
          if (allTraitIds.length > 0) {
            await tx.userTraitScore.createMany({
              data: allTraitIds.map((traitId) => ({
                userId: ctx.user.id,
                traitId,
                score: 1, // Set score to 1 for MVP as requested
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
    }),

  // examples
  // Public - anyone can see basic user profiles (for testing)
  getPublicProfiles: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        locationId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          locationId: input.locationId,
        },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          joinedAt: true,
          location: {
            select: {
              city: true,
              region: true,
            },
          },
        },
        take: input.limit,
      });
    }),
  // Protected - user can get their own full profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        location: true,
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });
  }),

  // Protected - user can update their own profile
  updateMyProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(2).max(50).optional(),
        avatarUrl: z.string().url().optional(),
        locationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
    }),
});
