import { authProcedure } from "../../trpc";

export const checkUserExists = authProcedure.query(async ({ ctx }) => {
  if (!ctx.supabaseUser) {
    return { exists: false };
  }

  const user = await ctx.prisma.user.findFirst({
    where: { authUserId: ctx.supabaseUser.id },
  });

  return { exists: !!user };
});
