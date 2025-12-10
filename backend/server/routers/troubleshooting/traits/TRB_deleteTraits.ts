import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteTraits = adminProcedure.mutation(async ({ ctx }) => {
  try {
    // First delete all UserTraitScores associated with TRB traits
    const deletedScores = await ctx.prisma.userTraitScore.deleteMany({
      where: {
        trait: {
          id: {
            startsWith: "TRB_",
          },
        },
      },
    });

    // Then delete all TRB traits
    const deletedTraits = await ctx.prisma.trait.deleteMany({
      where: {
        id: {
          startsWith: "TRB_",
        },
      },
    });

    return {
      success: true,
      deletedCount: {
        traits: deletedTraits.count,
        userTraitScores: deletedScores.count,
      },
    };
  } catch (error) {
    console.error("Error deleting traits:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete traits",
      cause: error,
    });
  }
});
