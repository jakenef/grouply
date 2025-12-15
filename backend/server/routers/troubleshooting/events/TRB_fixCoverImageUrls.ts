import { adminProcedure } from "@/backend/server/trpc";

export const TRB_fixCoverImageUrls = adminProcedure.mutation(
  async ({ ctx }) => {
    // Find all events with empty coverImageUrl
    const eventsToUpdate = await ctx.prisma.event.findMany({
      where: {
        OR: [{ coverImageUrl: "" }, { coverImageUrl: undefined }],
      },
      select: {
        id: true,
        imageUrls: true,
      },
    });

    let updated = 0;
    let failed = 0;

    for (const event of eventsToUpdate) {
      if (event.imageUrls && event.imageUrls.length > 0) {
        try {
          await ctx.prisma.event.update({
            where: { id: event.id },
            data: {
              coverImageUrl: event.imageUrls[0],
            },
          });
          updated++;
        } catch (error) {
          failed++;
          console.error(`Failed to update event ${event.id}:`, error);
        }
      } else {
        failed++;
      }
    }

    return {
      success: true,
      message: `Updated ${updated} events, ${failed} failed or had no images`,
      updated,
      failed,
      total: eventsToUpdate.length,
    };
  }
);
