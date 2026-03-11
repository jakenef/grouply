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
  },
);

// Create context with auth info
export const createContext = async ({ req }: CreateExpressContextOptions) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  const token = req.headers.authorization?.replace("Bearer ", "");

  console.log(
    `[Context:${requestId}] 🔑 Creating context for ${req.method} ${req.url}`,
  );
  console.log(`[Context:${requestId}] Has token: ${!!token}`);

  let user = null;
  let supabaseUser = null;

  if (token) {
    try {
      console.log(`[Context:${requestId}] Validating Supabase token...`);
      const tokenValidationStart = Date.now();

      // Verify the Supabase JWT token
      const {
        data: { user: authUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      const tokenValidationDuration = Date.now() - tokenValidationStart;
      console.log(
        `[Context:${requestId}] Token validation completed in ${tokenValidationDuration}ms`,
      );

      if (error) {
        console.error(
          `[Context:${requestId}] ❌ Token validation error:`,
          error.message,
        );
      } else if (authUser) {
        console.log(
          `[Context:${requestId}] ✅ Token valid for user: ${authUser.id}, email: ${authUser.email}`,
        );

        // Store the Supabase user info
        supabaseUser = authUser;

        // Look up the user in your Prisma database
        console.log(
          `[Context:${requestId}] Querying Prisma for user with authUserId: ${authUser.id}`,
        );
        const dbQueryStart = Date.now();

        user = await prisma.user.findUnique({
          where: { authUserId: authUser.id },
          select: {
            id: true,
            email: true,
            givenName: true,
            role: true,
            authUserId: true,
          },
        });

        const dbQueryDuration = Date.now() - dbQueryStart;
        console.log(
          `[Context:${requestId}] Database query completed in ${dbQueryDuration}ms`,
        );

        if (user) {
          console.log(
            `[Context:${requestId}] ✅ User found in database: ${user.id}, role: ${user.role}`,
          );
        } else {
          console.warn(
            `[Context:${requestId}] ⚠️ User not found in database (authUserId: ${authUser.id})`,
          );
        }
      }
    } catch (error: any) {
      // Invalid token - user stays null
      console.error(
        `[Context:${requestId}] ❌ Token validation exception:`,
        error.message || error,
      );
      console.error(`[Context:${requestId}] Stack trace:`, error.stack);
    }
  } else {
    console.log(`[Context:${requestId}] No token provided in request`);
  }

  const totalDuration = Date.now() - startTime;
  console.log(
    `[Context:${requestId}] 🏁 Context created in ${totalDuration}ms, hasUser: ${!!user}, hasSupabaseUser: ${!!supabaseUser}`,
  );

  return {
    prisma,
    user, // Current authenticated user (or null)
    supabaseUser, // Supabase auth user (or null)
    req, // Include the request object for debugging
    token, // Include the token for debugging
    requestId, // Include request ID for logging
  };
};

// Rest of your tRPC setup stays the same...
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure requires a fully registered user in the database
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const requestId = (ctx as any).requestId || "unknown";
  console.log(`[ProtectedProcedure:${requestId}] Checking authorization...`);

  if (!ctx.user) {
    // Get more information about why the auth failed
    console.error(
      `[ProtectedProcedure:${requestId}] ❌ Authorization FAILED:`,
      {
        hasToken: !!ctx.token,
        hasSupabaseUser: !!ctx.supabaseUser,
        tokenPrefix: ctx.token ? ctx.token.substring(0, 10) + "..." : "none",
      },
    );

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ctx.token
        ? "Valid authentication token required. The provided token may be expired or invalid."
        : "No authentication token provided. You must be logged in to access this endpoint.",
    });
  }

  console.log(
    `[ProtectedProcedure:${requestId}] ✅ Authorization successful for user: ${ctx.user.id}`,
  );

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
  const requestId = (ctx as any).requestId || "unknown";
  console.log(
    `[AuthProcedure:${requestId}] Checking Supabase authentication...`,
  );

  if (!ctx.supabaseUser) {
    console.error(
      `[AuthProcedure:${requestId}] ❌ Auth failed - no Supabase user`,
    );
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  }

  console.log(
    `[AuthProcedure:${requestId}] ✅ Supabase auth successful for user: ${ctx.supabaseUser.id}`,
  );

  return next({
    ctx: {
      ...ctx,
      supabaseUser: ctx.supabaseUser,
    },
  });
});

/**
 * Paid procedure requires an active subscription
 * Admins bypass this check
 */
export const paidProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const requestId = (ctx as any).requestId || "unknown";
  console.log(`[PaidProcedure:${requestId}] Checking subscription...`);

  // Admins bypass subscription checks
  if (ctx.user.role === "ADMIN") {
    console.log(`[PaidProcedure:${requestId}] ✅ User is ADMIN, bypassing check`);
    return next({ ctx });
  }

  const subscription = await ctx.prisma.subscription.findFirst({
    where: {
      userId: ctx.user.id,
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
    orderBy: {
      currentPeriodEnd: "desc",
    },
  });

  if (!subscription) {
    console.warn(`[PaidProcedure:${requestId}] ❌ No active subscription found for user: ${ctx.user.id}`);
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires an active subscription.",
    });
  }

  console.log(`[PaidProcedure:${requestId}] ✅ Active subscription found (expires: ${subscription.currentPeriodEnd})`);

  return next({
    ctx: {
      ...ctx,
      subscription,
    },
  });
});
