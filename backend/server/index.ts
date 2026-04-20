import dotenv from "dotenv";
dotenv.config();

import moduleAlias from "module-alias";
import path from "path";

// Register path aliases for production
moduleAlias.addAlias("@", path.join(__dirname, "../.."));

import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { appRouter } from "./routers";
import { createContext } from "./trpc";
const app = express();

// Configure CORS to allow legitimate origins while blocking malicious websites
app.use(
  cors({
    origin: [
      // Development - Expo mobile app
      "exp://127.0.0.1:8081",
      "exp://localhost:8081",

      // Development - Expo web
      "http://localhost:19006",

      // Development - Android emulator accessing host backend
      "http://10.0.2.2:3001",

      // Dynamic Expo dev server IPs (for testing on physical devices)
      /^exp:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:8081$/,
    ],
    credentials: true, // Allow cookies/auth headers
    // Methods and headers unrestricted for now
  }),
);

// General rate limiting for all endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes per IP/user
  // No custom keyGenerator - use default IP-based limiting with IPv6 support
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting specifically for AI endpoints (user-based only)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 25 AI messages per hour per user
  keyGenerator: (req) => {
    // AI endpoints require auth, so we can safely use user-based limiting
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return `ai-user:${authHeader}`;
    }
    // This should rarely happen since AI endpoints require auth
    return "unauthenticated-ai";
  },
  message: {
    error: "AI message limit exceeded. Please try again later.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all tRPC routes
app.use("/trpc", generalLimiter);

// Apply stricter rate limiting specifically to AI endpoints
app.use("/trpc/ai.userSendAIMessage", aiLimiter);

// Health check endpoint (before tRPC)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// tRPC endpoint
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});
