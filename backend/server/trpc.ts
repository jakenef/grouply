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
  let supabaseUser = null;

  if (token) {
    try {
      // Verify the Supabase JWT token
      const {
        data: { user: authUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (authUser && !error) {
        // Store the Supabase user info
        supabaseUser = authUser;

        // Look up the user in your Prisma database
        user = await prisma.user.findUnique({
          where: { authUserId: authUser.id },
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
    supabaseUser, // Supabase auth user (or null)
    req, // Include the request object for debugging
    token, // Include the token for debugging
  };
};

// Rest of your tRPC setup stays the same...
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure requires a fully registered user in the database
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    // Get more information about why the auth failed
    console.error("Auth failed:", {
      hasToken: !!ctx.token,
      hasSupabaseUser: !!ctx.supabaseUser,
      tokenPrefix: ctx.token ? ctx.token.substring(0, 10) + "..." : "none",
    });

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ctx.token
        ? "Valid authentication token required. The provided token may be expired or invalid."
        : "No authentication token provided. You must be logged in to access this endpoint.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Admin procedure requires a valid user with ADMIN role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This endpoint requires admin privileges",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Auth procedure only requires a valid Supabase token but not necessarily a DB user
// This is used for endpoints like user registration
export const authProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.supabaseUser) {
    console.error("Auth failed - no Supabase user");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  }
  return next({
    ctx: {
      ...ctx,
      supabaseUser: ctx.supabaseUser,
    },
  });
});
