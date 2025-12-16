import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getLocationById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const location = await ctx.prisma.location.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!location) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Location not found",
      });
    }

    return {
      placeId: location.id,
      city: location.city,
      region: location.region,
      country: null,
      countryCode: location.countryCode,
      lat: location.lat,
      lng: location.lng,
      formatted: location.formatted || "",
      name: location.city || location.formatted || "",
    };
  });
