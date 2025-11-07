import { router } from "../trpc";
import { interestsRouter } from "./interests";
import { locationsRouter } from "./locations";
import { messagesAIRouter } from "./messagesAI";
import { traitsRouter } from "./traits";
import { troubleshootingRouter } from "./troubleshooting";
import { usersRouter } from "./users/index";

export const appRouter = router({
  users: usersRouter,
  traits: traitsRouter,
  interests: interestsRouter,
  locations: locationsRouter,
  troubleshooting: troubleshootingRouter,
  ai: messagesAIRouter,
});

export type AppRouter = typeof appRouter;
