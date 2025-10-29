import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

const starterActivities = [
  {
    slug: "pickup-basketball",
    label: "Pickup Basketball",
  },
  {
    slug: "hiking",
    label: "Hiking",
  },
];

export const TRB_createActivities = adminProcedure.mutation(async ({ ctx }) => {
  try {
    const createdActivities = [];

    for (const activity of starterActivities) {
      const created = await ctx.prisma.activity.create({
        data: activity,
      });
      createdActivities.push(created);
    }

    return {
      success: true,
      count: createdActivities.length,
      activities: createdActivities,
    };
  } catch (error) {
    console.error("Error creating activities:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create activities",
      cause: error,
    });
  }
});
