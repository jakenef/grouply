import { authProcedure } from "../../trpc";

export const checkUserExists = authProcedure.query(async ({ ctx }) => {
  const requestId = (ctx as any).requestId || "unknown";
  const startTime = Date.now();

  console.log(
    `[checkUserExists:${requestId}] Checking if user exists for authUserId: ${ctx.supabaseUser.id}`,
  );

  if (!ctx.supabaseUser) {
    console.log(
      `[checkUserExists:${requestId}] No Supabase user, returning exists: false`,
    );
    return { exists: false };
  }

  try {
    const user = await ctx.prisma.user.findFirst({
      where: { authUserId: ctx.supabaseUser.id },
    });

    const duration = Date.now() - startTime;
    const exists = !!user;

    console.log(
      `[checkUserExists:${requestId}] ✅ Query completed in ${duration}ms, exists: ${exists}${user ? `, userId: ${user.id}` : ""}`,
    );

    return { exists };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(
      `[checkUserExists:${requestId}] ❌ Error checking user existence after ${duration}ms:`,
      error.message,
    );
    console.error(`[checkUserExists:${requestId}] Stack trace:`, error.stack);
    throw error;
  }
});
