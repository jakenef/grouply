import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { googlePlacesApi } from "../../utils/api/googlePlacesApi";

export const searchLocations = publicProcedure
  .input(
    z.object({
      query: z.string().min(1),
      precision: z.enum(["city", "venue"]).optional().default("city"),
    })
  )
  .query(async ({ input }) => {
    const { query, precision } = input;
    console.log(`[searchLocations] query="${query}" precision=${precision}`);
    try {
      const types = precision === "city" ? "(cities)" : undefined;

      const predictions = await googlePlacesApi.getPlaceAutocomplete(
        query,
        types
      );

      console.log(`[searchLocations] ${predictions.length} result(s) for "${query}"`);

      return predictions.map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting?.main_text || "",
        secondaryText: prediction.structured_formatting?.secondary_text || "",
      }));
    } catch (error) {
      console.error(`[searchLocations] error for query="${query}":`, error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to search locations",
      });
    }
  });
