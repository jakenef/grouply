import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { genderEnum, locationDataSchema } from "../../schemas";
import { authProcedure } from "../../trpc";

export const createUserAndUserProfile = authProcedure
  .input(
    z.object({
      givenName: z.string().trim().min(1),
      familyName: z.string().trim().min(1),
      birthday: z.coerce.date(),
      gender: genderEnum,
      location: locationDataSchema,
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (!ctx.supabaseUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

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

    let locationId: string;
    if (input.location) {
      const existingLocation = await ctx.prisma.location.findUnique({
        where: { id: input.location.placeId },
      });

      if (existingLocation) {
        locationId = existingLocation.id;
      } else {
        const newLocation = await ctx.prisma.location.create({
          data: {
            id: input.location.placeId,
            city: input.location.city || null,
            region: input.location.region || null,
            countryCode: input.location.countryCode || null,
            formatted: input.location.formatted,
            lat: input.location.lat,
            lng: input.location.lng,
            precision: "CITY",
          },
        });
        locationId = newLocation.id;
      }
    }

    try {
      const result = await ctx.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            authUserId: ctx.supabaseUser.id,
            email: ctx.supabaseUser.email || "",
            givenName: input.givenName,
            familyName: input.familyName,
            locationId: locationId,
            avatarUrl: input.avatarUrl,
            birthday: input.birthday,
            gender: input.gender,
            bio: input.bio,
          },
        });

        return { user };
      });

      return result;
    } catch (error) {
      console.error("Error creating user and profile:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user profile. Please try again.",
        cause: error,
      });
    }
  });
