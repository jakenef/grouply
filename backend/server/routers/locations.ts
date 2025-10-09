import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { googlePlacesApi } from "../utils/api/googlePlacesApi";

/**
 * Router for location-related functionality
 */
export const locationsRouter = router({
  // 1. Get location suggestions based on search text
  searchLocations: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const { query } = input;
        const predictions = await googlePlacesApi.getPlaceAutocomplete(query);

        // Format the predictions to return only what we need
        return predictions.map((prediction) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting?.main_text || "",
          secondaryText: prediction.structured_formatting?.secondary_text || "",
        }));
      } catch (error) {
        console.error("Error searching locations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search locations",
        });
      }
    }),

  // 2. Get detailed place information by place ID
  getPlaceDetails: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { placeId } = input;
        const placeDetails = await googlePlacesApi.getPlaceDetails(placeId);
        return {
          placeId,
          name: placeDetails.name,
          ...googlePlacesApi.extractLocationData(placeDetails),
        };
      } catch (error) {
        console.error("Error getting place details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get place details",
        });
      }
    }),

  // 3. Get location from coordinates (reverse geocoding)
  getLocationFromCoords: publicProcedure
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

        // Use the place ID to get detailed information
        const placeDetails = await googlePlacesApi.getPlaceDetails(placeId);

        return {
          placeId,
          ...googlePlacesApi.extractLocationData(placeDetails),
        };
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get location from coordinates",
        });
      }
    }),
});
