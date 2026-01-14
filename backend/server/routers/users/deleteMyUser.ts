import { supabase } from "../../supabase";
import { protectedProcedure } from "../../trpc";

export const deleteMyUser = protectedProcedure.mutation(async ({ ctx }) => {
  await supabase.auth.admin.deleteUser(ctx.user.authUserId);
  await ctx.prisma.user.delete({ where: { id: ctx.user.id } });
  return { success: true };
});
