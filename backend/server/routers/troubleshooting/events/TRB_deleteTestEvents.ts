import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteTestEvents = adminProcedure.mutation(async ({ ctx }) => {
  try {
    // Delete test events - cascade will handle registrations, snapshots, and saved events
    const deletedEvents = await ctx.prisma.event.deleteMany({
      where: {
        id: {
          startsWith: "TRB_",
        },
      },
    });

    return {
      success: true,
      deletedCount: {
        events: deletedEvents.count,
      },
    };
  } catch (error) {
    console.error("Error deleting events:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete events",
      cause: error,
    });
  }
});
