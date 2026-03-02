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
      email: z.string().email(),
    }),
  )
  .mutation(async ({ input }) => {
    try {
      // Generate magic link
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: input.email,
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
        email: input.email,
        loginLink,
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
