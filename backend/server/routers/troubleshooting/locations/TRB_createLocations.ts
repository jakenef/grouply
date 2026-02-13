import { adminProcedure } from "@/backend/server/trpc";
import { Location } from "@/shared/types/Location";
import { TRPCError } from "@trpc/server";

const testLocations: Location[] = [
  // =========================
  // PROVO
  // =========================
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
    id: "TRB_loc_provo_city",
    formatted: "Provo, UT",
    city: "Provo",
    region: "Utah",
    countryCode: "US",
    lat: 40.2338,
    lng: -111.6585,
    precision: "CITY",
  },

  // =========================
  // OREM
  // =========================
  {
    id: "TRB_loc_orem_university_place",
    formatted: "University Place Mall",
    city: "Orem",
    region: "Utah",
    countryCode: "US",
    lat: 40.2963,
    lng: -111.6947,
    precision: "POINT",
  },
  {
    id: "TRB_loc_orem_city",
    formatted: "Orem, UT",
    city: "Orem",
    region: "Utah",
    countryCode: "US",
    lat: 40.2969,
    lng: -111.6946,
    precision: "CITY",
  },

  // =========================
  // LEHI
  // =========================
  {
    id: "TRB_loc_lehi_outlets",
    formatted: "Outlets at Traverse Mountain",
    city: "Lehi",
    region: "Utah",
    countryCode: "US",
    lat: 40.4302,
    lng: -111.8927,
    precision: "POINT",
  },
  {
    id: "TRB_loc_lehi_city",
    formatted: "Lehi, UT",
    city: "Lehi",
    region: "Utah",
    countryCode: "US",
    lat: 40.3916,
    lng: -111.8508,
    precision: "CITY",
  },

  // =========================
  // WEST JORDAN
  // =========================
  {
    id: "TRB_loc_wj_jordan_landing",
    formatted: "Jordan Landing",
    city: "West Jordan",
    region: "Utah",
    countryCode: "US",
    lat: 40.5569,
    lng: -111.978,
    precision: "POINT",
  },
  {
    id: "TRB_loc_wj_city",
    formatted: "West Jordan, UT",
    city: "West Jordan",
    region: "Utah",
    countryCode: "US",
    lat: 40.6097,
    lng: -111.9391,
    precision: "CITY",
  },

  // =========================
  // SALT LAKE CITY
  // =========================
  {
    id: "TRB_loc_slc_temple",
    formatted: "Salt Lake Temple",
    city: "Salt Lake City",
    region: "Utah",
    countryCode: "US",
    lat: 40.7707,
    lng: -111.8926,
    precision: "POINT",
  },
  {
    id: "TRB_loc_slc_city",
    formatted: "Salt Lake City, UT",
    city: "Salt Lake City",
    region: "Utah",
    countryCode: "US",
    lat: 40.7608,
    lng: -111.891,
    precision: "CITY",
  },

  // =========================
  // TEMECULA, CA
  // =========================
  {
    id: "TRB_loc_temecula_prom",
    formatted: "Promenade Temecula",
    city: "Temecula",
    region: "California",
    countryCode: "US",
    lat: 33.5061,
    lng: -117.1493,
    precision: "POINT",
  },
  {
    id: "TRB_loc_temecula_city",
    formatted: "Temecula, CA",
    city: "Temecula",
    region: "California",
    countryCode: "US",
    lat: 33.4936,
    lng: -117.1484,
    precision: "CITY",
  },

  // =========================
  // OCEANSIDE, CA
  // =========================
  {
    id: "TRB_loc_oceanside_pier",
    formatted: "Oceanside Pier",
    city: "Oceanside",
    region: "California",
    countryCode: "US",
    lat: 33.1959,
    lng: -117.3795,
    precision: "POINT",
  },
  {
    id: "TRB_loc_oceanside_city",
    formatted: "Oceanside, CA",
    city: "Oceanside",
    region: "California",
    countryCode: "US",
    lat: 33.1959,
    lng: -117.3795,
    precision: "CITY",
  },

  // =========================
  // ROUND ROCK, TX
  // =========================
  {
    id: "TRB_loc_roundrock_dell",
    formatted: "Dell Technologies Headquarters",
    city: "Round Rock",
    region: "Texas",
    countryCode: "US",
    lat: 30.5083,
    lng: -97.6789,
    precision: "POINT",
  },
  {
    id: "TRB_loc_roundrock_city",
    formatted: "Round Rock, TX",
    city: "Round Rock",
    region: "Texas",
    countryCode: "US",
    lat: 30.5083,
    lng: -97.6789,
    precision: "CITY",
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
