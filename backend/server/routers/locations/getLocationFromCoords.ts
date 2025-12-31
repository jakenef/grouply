import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { googlePlacesApi } from "../../utils/api/googlePlacesApi";

export const getLocationFromCoords = publicProcedure
  .input(
    z.object({
      lat: z.number(),
      lng: z.number(),
    })
  )
  .query(async ({ input }) => {
    try {
      const { lat, lng } = input;
      const geocodeResponse = await googlePlacesApi.reverseGeocode(lat, lng);

      // Extract place ID for the city
      const placeId = geocodeResponse.results[0]?.place_id;

      if (!placeId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No location found for these coordinates",
        });
      }

      // Get detailed place information
      const placeDetails = await googlePlacesApi.getPlaceDetails(placeId);

      if (!placeDetails) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not get details for the location",
        });
      }

      return {
        placeId,
        ...googlePlacesApi.extractLocationData(placeDetails),
      };
    } catch (error) {
      // If it's already a TRPC error, re-throw it
      if (error instanceof TRPCError) {
        throw error;
      }

      // Otherwise log and throw a generic error
      console.error("Error getting location from coordinates:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get location from coordinates",
      });
    }
  });
