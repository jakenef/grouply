import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteTestLocations = adminProcedure.mutation(
  async ({ ctx }) => {
    try {
      // First delete all test locations
      const deletedLocations = await ctx.prisma.location.deleteMany({
        where: {
          id: {
            startsWith: "TRB_",
          },
        },
      });

      return {
        success: true,
        deletedCount: {
          locations: deletedLocations.count,
        },
      };
    } catch (error) {
      console.error("Error deleting locations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete locations",
        cause: error,
      });
    }
  }
);
