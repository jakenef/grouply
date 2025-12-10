import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteInterests = adminProcedure.mutation(async ({ ctx }) => {
  try {
    // First delete all UserInterests associated with TRB interests
    const deletedUserInterests = await ctx.prisma.userInterest.deleteMany({
      where: {
        interest: {
          id: {
            startsWith: "TRB_",
          },
        },
      },
    });

    // Then delete all TRB interests
    const deletedInterests = await ctx.prisma.interest.deleteMany({
      where: {
        id: {
          startsWith: "TRB_",
        },
      },
    });

    return {
      success: true,
      deletedCount: {
        interests: deletedInterests.count,
        userInterests: deletedUserInterests.count,
      },
    };
  } catch (error) {
    console.error("Error deleting interests:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete interests",
      cause: error,
    });
  }
});
