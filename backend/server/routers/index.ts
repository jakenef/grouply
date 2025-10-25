import { router } from "../trpc";
import { interestsRouter } from "./interests";
import { locationsRouter } from "./locations";
import { traitsRouter } from "./traits";
import { usersRouter } from "./users/index";

export const appRouter = router({
  users: usersRouter,
  traits: traitsRouter,
  interests: interestsRouter,
  locations: locationsRouter,
});

export type AppRouter = typeof appRouter;
