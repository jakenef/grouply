import { supabase } from "@/backend/server/supabase";
import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Admin endpoint to generate a magic link for impersonating a user in production
 * This allows admins to debug issues by logging in as any user without needing their password
 */
export const generateUserLoginLink = adminProcedure
  .input(
    z.object({
      email: z.string().email().optional(),
      userId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Must provide either email or userId
    if (!input.email && !input.userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Must provide either email or userId",
      });
    }

    try {
      // If userId provided, get the user's email first
      let targetEmail = input.email;

      if (input.userId && !targetEmail) {
        const dbUser = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!dbUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found in database",
          });
        }

        // Get Supabase user to get their email
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(dbUser.authUserId);

        if (authError || !authUser.user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found in Supabase auth",
            cause: authError,
          });
        }

        targetEmail = authUser.user.email;
      }

      if (!targetEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not determine user email",
        });
      }

      // Generate magic link
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: targetEmail,
      });

      if (error || !data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate login link",
          cause: error,
        });
      }

      // Extract the action link which contains the token
      const loginLink = data.properties.action_link;

      return {
        success: true,
        email: targetEmail,
        loginLink,
        // Also return just the token for easier deep linking
        token: loginLink.split("#")[1], // Returns everything after #
      };
    } catch (error) {
      console.error("Error generating user login link:", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate login link",
        cause: error,
      });
    }
  });
