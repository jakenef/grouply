import { createClient } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "./prisma";

// Create Supabase client for server-side operations
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side key, not anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create context with auth info
export const createContext = async ({ req }: CreateExpressContextOptions) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  let user = null;
  if (token) {
    try {
      // Verify the Supabase JWT token
      const {
        data: { user: supabaseUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (supabaseUser && !error) {
        // Look up the user in your Prisma database
        user = await prisma.user.findUnique({
          where: { authUserId: supabaseUser.id },
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            authUserId: true,
          },
        });
      }
    } catch (error) {
      // Invalid token - user stays null
      console.log("Token validation failed:", error);
    }
  }

  return {
    prisma,
    user, // Current authenticated user (or null)
  };
};

// Rest of your tRPC setup stays the same...
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
