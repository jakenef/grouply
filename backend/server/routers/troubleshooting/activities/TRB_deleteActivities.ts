import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteActivites = adminProcedure.mutation(async ({ ctx }) => {
  try {
    // First delete all activites
    const deletedActivities = await ctx.prisma.activity.deleteMany();

    return {
      success: true,
      deletedCount: {
        locations: deletedActivities.count,
      },
    };
  } catch (error) {
    console.error("Error deleting activities:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete activities",
      cause: error,
    });
  }
});
