import { supabase } from "@/backend/server/supabase";
import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";

export const TRB_deleteTestUsers = adminProcedure.mutation(async ({ ctx }) => {
  try {
    // Find all test users (identified by email domain)
    const testUsers = await ctx.prisma.user.findMany({
      where: {
        OR: [
          { email: { endsWith: "@grouply-test.app" } }, // New test users
          { authUserId: { startsWith: "TRB_" } }, // Old test users (if any remain)
        ],
      },
      select: {
        authUserId: true,
        email: true,
      },
    });

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Delete from Supabase Auth first
    let authDeletedCount = 0;
    for (const user of testUsers) {
      if (!UUID_REGEX.test(user.authUserId)) {
        // Old test users with non-UUID authUserId (e.g. "TRB_...") have no auth record to delete
        continue;
      }
      const { error } = await supabase.auth.admin.deleteUser(user.authUserId);
      if (!error) {
        authDeletedCount++;
      } else {
        console.warn(`Failed to delete auth user ${user.email}:`, error);
      }
    }

    // Then delete from database by email pattern
    const deletedUsers = await ctx.prisma.user.deleteMany({
      where: {
        OR: [
          { email: { endsWith: "@grouply-test.app" } },
          { authUserId: { startsWith: "TRB_" } },
        ],
      },
    });

    return {
      success: true,
      deletedCount: {
        users: deletedUsers.count,
        authUsers: authDeletedCount,
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
