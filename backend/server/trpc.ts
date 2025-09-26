import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "./prisma";

// Create context with auth info
export const createContext = async ({ req }: CreateExpressContextOptions) => {
  // Extract auth token from Authorization header
  const token = req.headers.authorization?.replace("Bearer ", "");

  let user = null;
  if (token) {
    try {
      // TODO: Validate JWT token with Supabase
      // For now, we'll simulate by assuming token is the userId
      // In real implementation, you'd decode/verify the JWT
      const userId = token; // Placeholder - will be replaced with proper JWT validation
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          authUserId: true,
        },
      });
    } catch (error) {
      // Invalid token - user stays null
    }
  }

  return {
    prisma,
    user, // Current authenticated user (or null)
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;

// Public procedure (no auth required)
export const publicProcedure = t.procedure;

// Protected procedure (auth required)
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
