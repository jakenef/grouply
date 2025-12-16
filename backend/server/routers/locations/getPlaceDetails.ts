import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { googlePlacesApi } from "../../utils/api/googlePlacesApi";

export const getPlaceDetails = publicProcedure
  .input(
    z.object({
      placeId: z.string(),
      precision: z.enum(["city", "venue"]).optional().default("city"),
    })
  )
  .query(async ({ input }) => {
    try {
      const { placeId, precision } = input;
      const placeDetails = await googlePlacesApi.getPlaceDetails(placeId);

      // If no place details found, return appropriate response
      if (!placeDetails) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No location found for this place ID",
        });
      }

      return {
        placeId,
        name: placeDetails.name,
        ...googlePlacesApi.extractLocationData(
          placeDetails,
          precision === "venue"
        ),
      };
    } catch (error) {
      // If it's already a TRPC error, re-throw it
      if (error instanceof TRPCError) {
        throw error;
      }

      // Otherwise log and throw a generic error
      console.error("Error getting place details:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get place details",
      });
    }
  });
