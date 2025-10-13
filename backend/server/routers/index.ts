import { router } from "../trpc";
import { locationsRouter } from "./locations";
import { usersRouter } from "./users";

export const appRouter = router({
  users: usersRouter,
  locations: locationsRouter,
});

export type AppRouter = typeof appRouter;
