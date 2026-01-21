import moduleAlias from "module-alias";
import path from "path";

// Register path aliases for production
moduleAlias.addAlias("@", path.join(__dirname, "../.."));

import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { appRouter } from "./routers";
import { createContext } from "./trpc";

dotenv.config();
const app = express();
app.use(cors());

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
  })
);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});
