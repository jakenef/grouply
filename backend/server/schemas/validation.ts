import { z } from "zod";

// Location data validation schema
export const locationDataSchema = z.object({
  placeId: z.string(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  formatted: z.string(),
  name: z.string().optional(),
});

// Gender enum validation
export const genderEnum = z.enum(["Male", "Female", "Other"]);

// Export types derived from schemas
export type LocationData = z.infer<typeof locationDataSchema>;
export type Gender = z.infer<typeof genderEnum>;
