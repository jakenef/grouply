import { adminProcedure } from "@/backend/server/trpc";
import { Location } from "@/shared/types/Location";
import { TRPCError } from "@trpc/server";

// Test locations with varying detail levels
const testLocations: Location[] = [
  // Provo area locations
  {
    id: "TRB_loc_byu",
    formatted: "Brigham Young University, Provo, UT 84602",
    city: "Provo",
    region: "Utah",
    countryCode: "US",
    lat: 40.2518,
    lng: -111.6493,
    precision: "POINT",
  },
  {
    id: "TRB_loc_provo_mall",
    formatted: "Provo Towne Centre",
    city: "Provo",
    region: "Utah",
    countryCode: "US",
    lat: 40.2177,
    lng: -111.6596,
    precision: "POINT",
  },
  {
    id: "TRB_loc_orem",
    formatted: "Orem, UT",
    city: "Orem",
    region: "Utah",
    countryCode: "US",
    lat: 40.2969,
    lng: -111.6946,
    precision: "CITY",
  },

  // Distant locations with varying detail
  {
    id: "TRB_loc_nyc",
    formatted: "Times Square, New York, NY",
    city: "New York",
    region: "New York",
    countryCode: "US",
    lat: 40.758,
    lng: -73.9855,
    precision: "POINT",
  },
  {
    id: "TRB_loc_london",
    formatted: "London, UK",
    city: "London",
    countryCode: "GB",
    lat: 51.5074,
    lng: -0.1278,
    precision: "CITY",
    region: null,
  },
  {
    id: "TRB_loc_tokyo",
    formatted: "Tokyo",
    city: "Tokyo",
    countryCode: "JP",
    lat: 35.6762,
    lng: 139.6503,
    precision: "CITY",
    region: null,
  },
  {
    id: "TRB_loc_sydney",
    formatted: "Sydney Opera House",
    city: "Sydney",
    region: "New South Wales",
    countryCode: "AU",
    lat: -33.8568,
    lng: 151.2153,
    precision: "POINT",
  },
];

export const TRB_createLocations = adminProcedure.mutation(async ({ ctx }) => {
  try {
    const createdLocations = [];

    for (const location of testLocations) {
      const created = await ctx.prisma.location.create({
        data: location,
      });
      createdLocations.push(created);
    }

    return {
      success: true,
      count: createdLocations.length,
      locations: createdLocations,
    };
  } catch (error) {
    console.error("Error creating test locations:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create test locations",
      cause: error,
    });
  }
});
