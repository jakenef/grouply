import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteTestUsers = adminProcedure.mutation(async ({ ctx }) => {
  try {
    // Then delete all test users
    const deletedUsers = await ctx.prisma.user.deleteMany({
      where: {
        authUserId: {
          startsWith: "TRB_",
        },
      },
    });

    return {
      success: true,
      deletedCount: {
        users: deletedUsers.count,
      },
    };
  } catch (error) {
    console.error("Error deleting test users:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete test users",
      cause: error,
    });
  }
});
