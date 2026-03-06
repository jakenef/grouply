import { protectedProcedure } from "../../trpc";

export const getMyUser = protectedProcedure.query(async ({ ctx }) => {
  const requestId = (ctx as any).requestId || "unknown";
  const startTime = Date.now();

  console.log(
    `[getMyUser:${requestId}] 👤 Fetching user profile for userId: ${ctx.user.id}`,
  );

  try {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        location: true,
        interests: {
          where: { interest: { isApproved: true } },
          include: { interest: true },
        },
        traitScores: {
          where: { trait: { isApproved: true } },
          include: { trait: true },
        },
      },
    });

    const duration = Date.now() - startTime;

    if (user) {
      console.log(
        `[getMyUser:${requestId}] ✅ User profile fetched successfully in ${duration}ms`,
      );
      console.log(
        `[getMyUser:${requestId}] User data: id=${user.id}, email=${user.email}, hasLocation=${!!user.location}, interests=${user.interests.length}, traits=${user.traitScores.length}`,
      );
    } else {
      console.warn(
        `[getMyUser:${requestId}] ⚠️ User profile not found in database (userId: ${ctx.user.id}) in ${duration}ms`,
      );
    }

    return user;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(
      `[getMyUser:${requestId}] ❌ Error fetching user profile after ${duration}ms:`,
      error.message,
    );
    console.error(`[getMyUser:${requestId}] Stack trace:`, error.stack);
    throw error;
  }
});
