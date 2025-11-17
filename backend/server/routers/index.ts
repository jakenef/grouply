import { router } from "../trpc";
import { eventsRouter } from "./events";
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
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
