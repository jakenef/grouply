import { supabase } from "../../supabase";
import { protectedProcedure } from "../../trpc";

export const deleteMyUser = protectedProcedure.mutation(async ({ ctx }) => {
  // Cancel all events hosted by this user
  await ctx.prisma.event.updateMany({
    where: {
      organizerId: ctx.user.id,
      isCanceled: false,
    },
    data: { isCanceled: true },
  });

  // Delete from Supabase Auth
  await supabase.auth.admin.deleteUser(ctx.user.authUserId);

  // Delete from database (cascade will handle related records)
  await ctx.prisma.user.delete({ where: { id: ctx.user.id } });

  return { success: true };
});
