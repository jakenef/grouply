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
