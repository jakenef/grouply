import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { googlePlacesApi } from "../../utils/api/googlePlacesApi";

export const searchLocations = publicProcedure
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
  });
